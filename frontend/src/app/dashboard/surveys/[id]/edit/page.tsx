'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { surveyApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const surveySchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(255),
});

type SurveyForm = z.infer<typeof surveySchema>;

export default function EditSurveyPage() {
  const params = useParams();
  const surveyId = params.id as string;
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SurveyForm>({
    resolver: zodResolver(surveySchema),
    defaultValues: { title: '' },
  });

  useEffect(() => {
    loadSurvey();
  }, [surveyId]);

  const loadSurvey = async () => {
    setLoading(true);
    try {
      const res = await surveyApi.getById(surveyId);
      setValue('title', res.data.title);
    } catch (error) {
      console.error('Erro ao carregar enquete:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SurveyForm) => {
    setSaving(true);
    setError('');

    try {
      await surveyApi.update(surveyId, { title: data.title });
      router.push(`/dashboard/surveys/${surveyId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar enquete. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/dashboard/surveys/${surveyId}`} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
          <span>Voltar</span>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Enquete</CardTitle>
          <CardDescription>Atualize as informações da sua enquete</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg" role="alert">
                {error}
              </div>
            )}

            <Input
              label="Título da Enquete"
              placeholder="Ex: Enquete Eleitoral 2024 - São Paulo"
              error={errors.title?.message}
              {...register('title')}
            />

            <CardFooter className="flex justify-end space-x-3">
              <Link href={`/dashboard/surveys/${surveyId}`}>
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" loading={saving}>
                {saving ? <Loader2 className="h-4 w-4" /> : 'Salvar Alterações'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}