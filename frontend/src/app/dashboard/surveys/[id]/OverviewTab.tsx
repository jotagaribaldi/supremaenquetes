'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { dashboardApi } from '@/lib/api';
import { DashboardOverview } from '@/types';
import { Loader2, Users, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface OverviewTabProps {
  surveyId: string;
}

export function OverviewTab({ surveyId }: OverviewTabProps) {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [surveyId]);

  const loadData = async () => {
    try {
      const res = await dashboardApi.getOverview(surveyId);
      setData(res.data);
    } catch (error) {
      console.error('Erro ao carregar visão geral:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse mb-2" />
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return <Card><CardContent>Erro ao carregar dados</CardContent></Card>;
  }

  const statCards = [
    {
      title: 'Total de Respostas',
      value: data.totalResponses,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Respostas Válidas',
      value: data.validResponses,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Respostas Inválidas',
      value: data.invalidResponses,
      icon: XCircle,
      color: 'bg-red-500',
    },
    {
      title: 'Taxa de Validade',
      value: `${data.validityRate}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
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
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Enquete</CardTitle>
          <CardDescription>Dados básicos sobre esta enquete</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">ID da Enquete</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{data.survey.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Título</dt>
              <dd className="mt-1 text-sm text-gray-900">{data.survey.title}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}