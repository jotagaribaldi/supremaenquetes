'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { surveyApi, dashboardApi, responseApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Survey, DashboardOverview, VoteDistribution, Demographics, GeoPoint, TimeSeriesPoint, Response } from '@/types';
import { Loader2, BarChart3, Users, MapPin, Calendar, ExternalLink, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OverviewTab } from './OverviewTab';
import { ResultsTab } from './ResultsTab';
import { ResponsesTab } from './ResponsesTab';
import { MapTab } from './MapTab';

export default function SurveyDetailPage() {
  const params = useParams();
  const surveyId = params.id as string;
  const { user } = useAuthStore();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'responses' | 'map'>('overview');
  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    loadSurvey();
    setPublicUrl(`${window.location.origin}/survey/${surveyId}`);
  }, [surveyId]);

  const loadSurvey = async () => {
    try {
      const res = await surveyApi.getById(surveyId);
      setSurvey(res.data);
    } catch (error) {
      console.error('Erro ao carregar enquete:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyPublicUrl = async () => {
    await navigator.clipboard.writeText(publicUrl);
    alert('Link copiado para a área de transferência!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!survey) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-gray-500">Enquete não encontrada</p>
        </CardContent>
      </Card>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'results', label: 'Resultados', icon: Users },
    { id: 'responses', label: 'Respostas', icon: Calendar },
    { id: 'map', label: 'Mapa', icon: MapPin },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
          <p className="text-gray-600 mt-1">
            Criada em {format(new Date(survey.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={copyPublicUrl}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Link Público
          </Button>
          <Link href={`/dashboard/surveys/${surveyId}/edit`}>
            <Button variant="outline" size="sm">
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'overview' | 'results' | 'responses' | 'map')} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center justify-center space-x-2">
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab surveyId={surveyId} />
        </TabsContent>

        <TabsContent value="results">
          <ResultsTab surveyId={surveyId} />
        </TabsContent>

        <TabsContent value="responses">
          <ResponsesTab surveyId={surveyId} />
        </TabsContent>

        <TabsContent value="map">
          <MapTab surveyId={surveyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}