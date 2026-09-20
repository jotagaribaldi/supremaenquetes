'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, BarChart3, Trash2, Edit, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { surveyApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Survey } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SurveysPage() {
  const { user } = useAuthStore();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const res = await surveyApi.list(user?.tenantId);
      setSurveys(res.data);
    } catch (error) {
      console.error('Erro ao carregar enquetes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta enquete?')) return;
    setDeletingId(id);
    try {
      await surveyApi.delete(id);
      setSurveys(surveys.filter((s) => s.id !== id));
    } catch (error) {
      alert('Erro ao excluir enquete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enquetes</h1>
          <p className="text-gray-600 mt-1">Gerencie suas enquetes eleitorais</p>
        </div>
        <Link href="/dashboard/surveys/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Enquete
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
            <p className="mt-2 text-gray-500">Carregando enquetes...</p>
          </CardContent>
        </Card>
      ) : surveys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma enquete criada</h3>
            <p className="mt-2 text-gray-500">Crie sua primeira enquete eleitoral para começar a coletar respostas</p>
            <Link href="/dashboard/surveys/new">
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Criar Enquete
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enquete</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respostas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criada em</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {surveys.map((survey) => (
                    <tr key={survey.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/surveys/${survey.id}`} className="font-medium text-gray-900 hover:text-primary-600">
                          {survey.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {survey._count?.responses || 0}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {format(new Date(survey.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/dashboard/surveys/${survey.id}`}>
                            <Button variant="ghost" size="sm">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/surveys/${survey.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(survey.id)}
                            disabled={deletingId === survey.id}
                          >
                            {deletingId === survey.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}