'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, BarChart3, Users, TrendingUp, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { surveyApi, dashboardApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Survey, DashboardOverview } from '@/types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    validResponses: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [surveysRes, usageRes] = await Promise.all([
        surveyApi.list(),
        dashboardApi.getOverview('').catch(() => ({ data: { validResponses: 0 } })),
      ]);
      setSurveys(surveysRes.data);
      setStats({
        totalSurveys: surveysRes.data.length,
        totalResponses: surveysRes.data.reduce((acc: number, s: Survey) => acc + (s._count?.responses || 0), 0),
        validResponses: 0,
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total de Enquetes',
      value: stats.totalSurveys,
      icon: BarChart3,
      color: 'bg-blue-500',
      href: '/dashboard/surveys',
    },
    {
      title: 'Total de Respostas',
      value: stats.totalResponses,
      icon: Users,
      color: 'bg-green-500',
      href: '/dashboard/surveys',
    },
    {
      title: 'Respostas Válidas',
      value: stats.validResponses,
      icon: AlertCircle,
      color: 'bg-purple-500',
      href: '/dashboard/surveys',
    },
    {
      title: 'Taxa de Validade',
      value: stats.totalResponses > 0 ? `${((stats.validResponses / stats.totalResponses) * 100).toFixed(1)}%` : '0%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      href: '/dashboard/surveys',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bem-vindo, {user?.name}! Visão geral das suas enquetes.</p>
        </div>
        <Link href="/dashboard/surveys/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Enquete
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href} className="block">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suas Enquetes Recentes</CardTitle>
          <CardDescription>Gerencie e visualize os resultados das suas enquetes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : surveys.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma enquete criada</h3>
              <p className="mt-2 text-gray-500">Crie sua primeira enquete eleitoral para começar a coletar respostas</p>
              <Link href="/dashboard/surveys/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Enquete
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {surveys.slice(0, 5).map((survey) => (
                <Link
                  key={survey.id}
                  href={`/dashboard/surveys/${survey.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">{survey.title}</p>
                    <p className="text-sm text-gray-500">
                      {survey._count?.responses || 0} respostas • {new Date(survey.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </Link>
              ))}
              {surveys.length > 5 && (
                <Link
                  href="/dashboard/surveys"
                  className="text-center text-primary-600 hover:underline font-medium"
                >
                  Ver todas as {surveys.length} enquetes →
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}