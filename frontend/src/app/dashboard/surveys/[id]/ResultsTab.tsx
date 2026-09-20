'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { dashboardApi } from '@/lib/api';
import { VoteDistribution } from '@/types';
import { Loader2, BarChart3, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface ResultsTabProps {
  surveyId: string;
}

export function ResultsTab({ surveyId }: ResultsTabProps) {
  const [data, setData] = useState<VoteDistribution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [surveyId]);

  const loadData = async () => {
    try {
      const res = await dashboardApi.getVotes(surveyId);
      setData(res.data);
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = (title: string, votes: { name: string; value: number }[], key: string) => {
    if (!votes || votes.length === 0) {
      return (
        <Card key={key}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>{title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-8 text-center text-gray-500">
            Nenhum voto registrado
          </CardContent>
        </Card>
      );
    }

    const total = votes.reduce((acc, v) => acc + v.value, 0);

    return (
      <Card key={key}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={votes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip
                  formatter={(value: number) => [`${value} votos`, `${((value / total) * 100).toFixed(1)}%`]}
                  labelFormatter={(name) => name}
                />
                <Bar
                  dataKey="value"
                  fill="#0ea5e9"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {votes.slice(0, 5).map((vote, index) => (
              <div key={vote.name} className="flex items-center space-x-3">
                <div
                  className="h-3 w-3 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-gray-900">{vote.name}</span>
                <span className="text-sm text-gray-500">{vote.value} votos</span>
                <span className="text-sm text-gray-400">
                  ({((vote.value / total) * 100).toFixed(1)}%)
                </span>
                {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {['Governador', 'Presidente', 'Senador', 'Dep. Estadual', 'Dep. Federal'].map((title) => (
          <Card key={title}>
            <CardContent className="h-64 animate-pulse bg-gray-50" />
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return <Card><CardContent>Erro ao carregar resultados</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      {renderChart('Governador', data.governor, 'governor')}
      {renderChart('Presidente', data.president, 'president')}
      {renderChart('Senador', data.senator, 'senator')}
      {renderChart('Deputado Estadual', data.stateDeputy, 'stateDeputy')}
      {renderChart('Deputado Federal', data.federalDeputy, 'federalDeputy')}
    </div>
  );
}