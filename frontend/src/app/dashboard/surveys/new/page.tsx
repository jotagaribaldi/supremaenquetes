'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { surveyApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

const surveySchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(255),
  state: z.string().length(2, 'Estado é obrigatório'),
});

type SurveyForm = z.infer<typeof surveySchema>;

export default function NewSurveyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SurveyForm>({
    resolver: zodResolver(surveySchema),
    defaultValues: { title: '' },
  });

  const onSubmit = async (data: SurveyForm) => {
    setLoading(true);
    setError('');

    try {
      await surveyApi.create({
        title: data.title,
        state: data.state,
        tenantId: user?.tenantId,
      });
      router.push('/dashboard/surveys');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar enquete. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/surveys" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
          <span>Voltar</span>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova Enquete</CardTitle>
          <CardDescription>Crie uma nova enquete eleitoral para começar a coletar respostas</CardDescription>
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
              placeholder="Ex: Enquete Eleitoral 2024 - Tocantins"
              error={errors.title?.message}
              {...register('title')}
            />

            <Select
              label="Estado da Enquete"
              placeholder="Selecione o estado"
              options={BRAZILIAN_STATES}
              error={errors.state?.message}
              {...register('state')}
            />

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Campos que serão coletados automaticamente:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Cidade (select)</li>
                <li>• Sexo (Masculino/Feminino)</li>
                <li>• Faixa etária (16-24, 25-34, 35-44, 45-59, 60+)</li>
                <li>• Escolaridade (Fundamental, Médio, Superior)</li>
                <li>• Votos para: Governador, Presidente, Senador, Dep. Estadual, Dep. Federal</li>
                <li>• IP do usuário</li>
                <li>• Geolocalização (latitude/longitude via navegador)</li>
              </ul>
              <p className="mt-2 text-xs text-gray-500">
                <strong>Antifraude:</strong> Respostas do mesmo IP ou a menos de 25m de outra resposta válida
                serão marcadas como inválidas automaticamente.
              </p>
            </div>

            <CardFooter className="flex justify-end space-x-3">
              <Link href="/dashboard/surveys">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" loading={loading}>
                {loading ? <Loader2 className="h-4 w-4" /> : 'Criar Enquete'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}