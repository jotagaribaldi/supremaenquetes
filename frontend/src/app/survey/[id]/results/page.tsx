'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, CheckCircle, Share2, Twitter, Facebook, MessageSquare, Mail } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LabelList,
} from 'recharts';

interface VoteCount {
  label: string;
  value: number;
  color?: string;
}

interface DemographicData {
  label: string;
  count: number;
}

interface CandidateByGender {
  candidate: string;
  masculino: number;
  feminino: number;
  total: number;
}

interface CandidateByGenderPercentage {
  candidate: string;
  masculino: number;
  feminino: number;
}

interface CandidateByAgeRange {
  ageRange: string;
  total: number;
  candidates: { candidate: string; count: number; percentage: number }[];
}

interface SurveyResults {
  totalResponses: number;
  governor: VoteCount[];
  president: VoteCount[];
  senator: VoteCount[];
  federalDeputy: VoteCount[];
  stateDeputy: VoteCount[];
  gender: DemographicData[];
  ageRange: DemographicData[];
  education: DemographicData[];
  presidentEvaluation: VoteCount[];
  governorEvaluation: VoteCount[];
  tocantinsVote: VoteCount[];
  stateDeputyReelectionRejection: VoteCount[];
  governorByGender: CandidateByGender[];
  presidentByGender: CandidateByGender[];
  presidentByAgeRange: CandidateByAgeRange[];
  governorByAgeRange: CandidateByAgeRange[];
  governorByGenderPercentage: CandidateByGenderPercentage[];
}

const COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

export default function SurveyResultsPage() {
  const params = useParams();
  const surveyId = params.id as string;
  const router = useRouter();
  
  const [results, setResults] = useState<SurveyResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetchResults();
    setShareUrl(window.location.origin + `/survey/${surveyId}`);
  }, [surveyId]);

  const fetchResults = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/responses/survey/${surveyId}/results`);
      if (!res.ok) throw new Error('Erro ao carregar resultados');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError('Não foi possível carregar os resultados');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform: string) => {
    const text = encodeURIComponent('Participei da enquete e vi os resultados!');
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${text}%20${encodeURIComponent(shareUrl)}`,
      email: `mailto:?subject=Resultados da Enquete&body=${text}%20${encodeURIComponent(shareUrl)}`,
    };
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    alert('Link copiado para a área de transferência!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
            <p className="mt-2 text-gray-500">Carregando resultados...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-4xl text-center">
          <CardContent className="py-12">
            <p className="text-red-500">{error || 'Erro ao carregar resultados'}</p>
            <Button onClick={() => router.push(`/survey/${surveyId}`)} className="mt-4">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Obrigado por participar!</h1>
          <p className="mt-2 text-gray-600">Sua resposta foi registrada com sucesso. Veja abaixo os resultados parciais da enquete.</p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="outline" onClick={copyLink} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Copiar Link
          </Button>
          <Button variant="outline" onClick={() => handleShare('twitter')} className="flex items-center gap-2">
            <Twitter className="h-4 w-4" />
            Twitter
          </Button>
          <Button variant="outline" onClick={() => handleShare('facebook')} className="flex items-center gap-2">
            <Facebook className="h-4 w-4" />
            Facebook
          </Button>
          <Button variant="outline" onClick={() => handleShare('whatsapp')} className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button variant="outline" onClick={() => handleShare('email')} className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            E-mail
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ResultsCard title="Total de Respostas" subtitle={`${results.totalResponses} participantes`}>
            <div className="text-4xl font-bold text-primary-600">{results.totalResponses}</div>
          </ResultsCard>

          {results.governor.length > 0 && (
            <ChartCard title="Intenção de Voto - Governador">
              <BarChartWrapper data={results.governor} />
            </ChartCard>
          )}

          {results.governor.length > 0 && (
            <ChartCard title="Intenção de Voto - Governador">
              <BarChartWrapper data={results.governor} />
            </ChartCard>
          )}

          {results.governorByGender && results.governorByGender.length > 0 && (
            <ChartCard title="Voto para Governador por Sexo">
              <GroupedBarChartWrapper data={results.governorByGender} />
            </ChartCard>
          )}

          {results.governorByGenderPercentage && results.governorByGenderPercentage.length > 0 && (
            <ChartCard title="Preferência para Governador por Sexo (% por sexo)">
              <GenderStackedBarChartWrapper data={results.governorByGenderPercentage} />
            </ChartCard>
          )}

          {results.governorByAgeRange && results.governorByAgeRange.length > 0 && (
            <ChartCard title="Voto para Governador por Faixa Etária (% por faixa)">
              <StackedBarChartWrapper data={results.governorByAgeRange} />
            </ChartCard>
          )}

          {results.president.length > 0 && (
            <ChartCard title="Intenção de Voto - Presidente">
              <BarChartWrapper data={results.president} />
            </ChartCard>
          )}

          {results.presidentByGender && results.presidentByGender.length > 0 && (
            <ChartCard title="Voto para Presidente por Sexo">
              <GroupedBarChartWrapper data={results.presidentByGender} />
            </ChartCard>
          )}

          {results.presidentByAgeRange && results.presidentByAgeRange.length > 0 && (
            <ChartCard title="Voto para Presidente por Faixa Etária (% por faixa)">
              <StackedBarChartWrapper data={results.presidentByAgeRange} />
            </ChartCard>
          )}

          {results.governorByAgeRange && results.governorByAgeRange.length > 0 && (
            <ChartCard title="Voto para Governador por Faixa Etária (% por faixa)">
              <StackedBarChartWrapper data={results.governorByAgeRange} />
            </ChartCard>
          )}

          {results.senator.length > 0 && (
            <ChartCard title="Intenção de Voto - Senador (1º voto)">
              <BarChartWrapper data={results.senator} />
            </ChartCard>
          )}

          {results.federalDeputy.length > 0 && (
            <ChartCard title="Intenção de Voto - Deputado Federal">
              <BarChartWrapper data={results.federalDeputy} />
            </ChartCard>
          )}

          {results.stateDeputy.length > 0 && (
            <ChartCard title="Intenção de Voto - Deputado Estadual">
              <BarChartWrapper data={results.stateDeputy} />
            </ChartCard>
          )}

          {results.presidentByGender && results.presidentByGender.length > 0 && (
            <ChartCard title="Voto para Presidente por Sexo">
              <GroupedBarChartWrapper data={results.presidentByGender} />
            </ChartCard>
          )}

          {results.governorByGender && results.governorByGender.length > 0 && (
            <ChartCard title="Voto para Governador por Sexo">
              <GroupedBarChartWrapper data={results.governorByGender} />
            </ChartCard>
          )}
        </div>

        <Button onClick={() => router.push(`/survey/${surveyId}`)} className="mx-auto block max-w-xs">
          Voltar à Enquete
        </Button>
      </div>
    </div>
  );
}

function ResultsCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="flex items-center justify-center min-h-[100px]">
        {children}
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: 300 }}>{children}</div>
      </CardContent>
    </Card>
  );
}

function BarChartWrapper({ data, horizontal = false }: { data: VoteCount[]; horizontal?: boolean }) {
  if (data.length === 0) return <div className="text-center text-gray-500 h-full flex items-center justify-center">Sem dados</div>;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const dataWithPct = data.map(d => ({
    ...d,
    percentage: total > 0 ? (d.value / total) * 100 : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      {horizontal ? (
        <BarChart layout="vertical" data={dataWithPct}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={v => `${v}%`} />
          <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'porcentagem']} />
          <Bar dataKey="percentage" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          <LabelList dataKey="percentage" position="insideRight" formatter={(v: number) => `${v.toFixed(1)}%`} fontSize={11} fill="#fff" />
        </BarChart>
      ) : (
        <BarChart data={dataWithPct}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis type="number" tickFormatter={v => `${v}%`} domain={[0, 100]} />
          <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'porcentagem']} />
          <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <LabelList dataKey="percentage" position="top" formatter={(v: number) => `${v.toFixed(1)}%`} fontSize={11} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}

function PieChartWrapper({ data }: { data: VoteCount[] }) {
  if (data.length === 0) return <div className="text-center text-gray-500 h-full flex items-center justify-center">Sem dados</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          nameKey="label"
          label={({ label, percent }) => `${label} ${(percent * 100).toFixed(1)}%`}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [value, 'votos']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

function GroupedBarChartWrapper({ data }: { data: CandidateByGender[] }) {
  if (data.length === 0) return <div className="text-center text-gray-500 h-full flex items-center justify-center">Sem dados</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="candidate" tick={{ fontSize: 11 }} />
        <YAxis type="number" />
        <Tooltip formatter={(value: number, name: string) => [value, name === 'masculino' ? 'Homens' : 'Mulheres']} />
        <Legend />
        <Bar dataKey="masculino" fill="#3b82f6" name="Homens" radius={[4, 4, 0, 0]} />
        <Bar dataKey="feminino" fill="#ec4899" name="Mulheres" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function StackedBarChartWrapper({ data }: { data: { ageRange: string; total: number; candidates: { candidate: string; count: number; percentage: number }[] }[] }) {
  if (data.length === 0) return <div className="text-center text-gray-500 h-full flex items-center justify-center">Sem dados</div>;

  const allCandidates = Array.from(new Set(data.flatMap(d => d.candidates.map(c => c.candidate))));
  
  const chartData = data.map(d => {
    const obj: any = { ageRange: d.ageRange };
    allCandidates.forEach(candidate => {
      const found = d.candidates.find(c => c.candidate === candidate);
      obj[candidate] = found ? found.percentage : 0;
    });
    return obj;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="ageRange" type="category" tick={{ fontSize: 11 }} />
        <YAxis type="number" tickFormatter={v => `${v}%`} />
        <Tooltip formatter={(value: number, name: string) => [value, `${name} ${value}%`]} />
        <Legend />
        {allCandidates.map((candidate, index) => (
          <Bar key={candidate} dataKey={candidate} name={candidate} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function GenderStackedBarChartWrapper({ data }: { data: CandidateByGenderPercentage[] }) {
  if (data.length === 0) return <div className="text-center text-gray-500 h-full flex items-center justify-center">Sem dados</div>;

  const chartData = [
    { gender: 'Masculino', ...Object.fromEntries(data.map(d => [d.candidate, d.masculino])) },
    { gender: 'Feminino', ...Object.fromEntries(data.map(d => [d.candidate, d.feminino])) },
  ];
  const allCandidates = data.map(d => d.candidate);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="gender" type="category" tick={{ fontSize: 14 }} />
        <YAxis type="number" tickFormatter={v => `${v}%`} domain={[0, 100]} />
        <Tooltip formatter={(value: number, name: string) => [value, `${name} ${value}%`]} />
        <Legend orientation="horizontal" verticalAlign="bottom" dy={20} />
        {data.map((d, index) => (
          <Bar key={d.candidate} dataKey={d.candidate} name={d.candidate} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}