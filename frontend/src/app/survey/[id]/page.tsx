'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { surveyApi, responseApi, candidateApi } from '@/lib/api';
import { Survey } from '@/types';
import { Loader2, CheckCircle, MapPin, AlertCircle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const responseSchema = z.object({
  tocantinsVote: z.enum(['Sim', 'Não']).or(z.literal('')),
  gender: z.enum(['Masculino', 'Feminino']).or(z.literal('')),
  ageRange: z.enum(['16-24', '25-34', '35-44', '45-59', '60+']).or(z.literal('')),
  education: z.enum(['Ensino Fundamental', 'Ensino Médio', 'Ensino Superior']).or(z.literal('')),
  governorVote: z.string().optional(),
  presidentVote: z.string().optional(),
  senatorVote: z.string().optional(),
  stateDeputyVote: z.string().optional(),
  federalDeputyVote: z.string().optional(),
  ipAddress: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  surveyId: z.string(),
});

type ResponseForm = z.infer<typeof responseSchema>;

const genderOptions = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
];

const ageRangeOptions = [
  { value: '16-24', label: '16 a 24 anos' },
  { value: '25-34', label: '25 a 34 anos' },
  { value: '35-44', label: '35 a 44 anos' },
  { value: '45-59', label: '45 a 59 anos' },
  { value: '60+', label: '60 anos ou mais' },
];

const educationOptions = [
  { value: 'Ensino Fundamental', label: 'Ensino Fundamental' },
  { value: 'Ensino Médio', label: 'Ensino Médio' },
  { value: 'Ensino Superior', label: 'Ensino Superior' },
];

const tocantinsOptions = [
  { value: 'Sim', label: 'Sim' },
  { value: 'Não', label: 'Não' },
];

// Special candidate options that appear at the top of each dropdown
const specialCandidateOptions = [
  { value: 'NULL_BLANK', label: 'Voto Nulo / Branco' },
  { value: 'UNDECIDED', label: 'Não sei / Não respondeu' },
];

function getCandidateOptions(candidates: any[]) {
  return [
    ...specialCandidateOptions,
    ...candidates.map(c => ({ value: c.urnName, label: `${c.candidateNumber} - ${c.urnName} (${c.partyAcronym})` }))
  ];
}

export default function PublicSurveyPage() {
  const params = useParams();
  const surveyId = params.id as string;
  const router = useRouter();
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string; isValid: boolean } | null>(null);
  const [geoLocation, setGeoLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [ipAddress, setIpAddress] = useState('');
  const [candidates, setCandidates] = useState<{
    president: any[];
    governor: any[];
    senator: any[];
    federalDeputy: any[];
    stateDeputy: any[];
  }>({
    president: [],
    governor: [],
    senator: [],
    federalDeputy: [],
    stateDeputy: [],
  });
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  control,
  } = useForm<ResponseForm>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      tocantinsVote: '',
      gender: '',
      ageRange: '',
      education: '',
      governorVote: '',
      presidentVote: '',
      senatorVote: '',
      stateDeputyVote: '',
      federalDeputyVote: '',
      ipAddress: '',
      latitude: 0,
      longitude: 0,
      surveyId,
    },
  });

  useEffect(() => {
    loadSurvey();
    getIPAddress();
    getGeolocation();
  }, [surveyId]);

  const loadSurvey = async () => {
    try {
      const res = await surveyApi.getPublic(surveyId);
      setSurvey(res.data);
      if (res.data.state) {
        setCandidatesLoading(true);
        const candidatesRes = await candidateApi.listBySurvey(surveyId);
        setCandidates(candidatesRes.data);
        setCandidatesLoading(false);
      }
    } catch (error) {
      console.error('Erro ao carregar enquete:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIPAddress = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      setIpAddress(data.ip);
      setValue('ipAddress', data.ip);
    } catch (error) {
      console.error('Erro ao obter IP:', error);
      setIpAddress('Não detectado');
      setValue('ipAddress', '0.0.0.0');
    }
  };

  const getGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setGeoLocation({ lat: latitude, lng: longitude });
          setValue('latitude', latitude);
          setValue('longitude', longitude);
        },
        (error) => {
          console.error('Erro ao obter geolocalização:', error);
          setValue('latitude', 0);
          setValue('longitude', 0);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const onSubmit = async (data: ResponseForm) => {
    if (!geoLocation) {
      setSubmitResult({
        success: false,
        message: 'Geolocalização é obrigatória. Permita o acesso à sua localização.',
        isValid: false,
      });
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await responseApi.create(data);
      setSubmitResult({
        success: true,
        message: res.data.isValid
          ? 'Resposta registrada com sucesso! Obrigado por participar.'
          : 'Resposta registrada, mas marcada como inválida pelo sistema antifraude (mesmo IP ou proximidade < 25m).',
        isValid: res.data.isValid,
      });
      setTimeout(() => {
        router.push('/survey/' + surveyId + '?submitted=true');
      }, 3000);
    } catch (err: any) {
      setSubmitResult({
        success: false,
        message: err.response?.data?.message || 'Erro ao enviar resposta. Tente novamente.',
        isValid: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
            <p className="mt-2 text-gray-500">Carregando enquete...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-2xl text-center">
          <CardContent className="py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">Enquete não encontrada</h2>
            <p className="mt-2 text-gray-500">Esta enquete não existe ou foi removida.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const watchedGender = watch('gender');
  const watchedAgeRange = watch('ageRange');
  const watchedEducation = watch('education');
  const watchedTocantins = watch('tocantinsVote');
  const progress = [watchedTocantins, watchedGender, watchedAgeRange, watchedEducation].filter(Boolean).length / 4 * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-primary-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">{survey.title}</CardTitle>
            <CardDescription>Sua participação é importante para a democracia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1 text-center">
                {Math.round(progress)}% concluído
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {submitResult && (
                <div
                  className={cn(
                    'p-4 rounded-lg flex items-start space-x-3',
                    submitResult.isValid ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
                  )}
                >
                  {submitResult.isValid ? (
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">{submitResult.message}</p>
                </div>
              )}

              <div className="space-y-4">
                <Select
                  label="Você vota no estado do Tocantins? *"
                  options={tocantinsOptions}
                  placeholder="Selecione"
                  error={errors.tocantinsVote?.message}
                  {...register('tocantinsVote')}
                />

                <Select
                  label="Sexo *"
                  options={genderOptions}
                  placeholder="Selecione"
                  error={errors.gender?.message}
                  {...register('gender')}
                />

                <Select
                  label="Faixa etária *"
                  options={ageRangeOptions}
                  placeholder="Selecione"
                  error={errors.ageRange?.message}
                  {...register('ageRange')}
                />

                <Select
                  label="Escolaridade *"
                  options={educationOptions}
                  placeholder="Selecione"
                  error={errors.education?.message}
                  {...register('education')}
                />
              </div>

<div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Intenção de voto (opcional)</h3>
                <div className="space-y-4">
                  <Controller
                    name="governorVote"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        label="Governador"
                        placeholder="Selecione o candidato"
                        searchPlaceholder="Buscar governador..."
                        options={getCandidateOptions(candidates.governor)}
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name="presidentVote"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        label="Presidente"
                        placeholder="Selecione o candidato"
                        searchPlaceholder="Buscar presidente..."
                        options={getCandidateOptions(candidates.president || [])}
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name="senatorVote"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        label="Senador"
                        placeholder="Selecione o candidato"
                        searchPlaceholder="Buscar senador..."
                        options={getCandidateOptions(candidates.senator)}
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name="federalDeputyVote"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        label="Deputado Federal"
                        placeholder="Selecione o candidato"
                        searchPlaceholder="Buscar deputado federal..."
                        options={getCandidateOptions(candidates.federalDeputy)}
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name="stateDeputyVote"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        label="Deputado Estadual"
                        placeholder="Selecione o candidato"
                        searchPlaceholder="Buscar deputado estadual..."
                        options={getCandidateOptions(candidates.stateDeputy)}
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Dados automáticos capturados</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">IP: </span>
                    <span className="font-mono">{ipAddress}</span>
                  </div>
                  <div>
                    <span className="font-medium">Localização: </span>
                    {geoLocation ? (
                      <>
                        <span className="text-green-600">✓ Capturada</span>
                        <p className="text-xs">Lat: {geoLocation.lat.toFixed(6)}, Lng: {geoLocation.lng.toFixed(6)}</p>
                      </>
                    ) : (
                      <span className="text-yellow-600">Aguardando permissão...</span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  <Shield className="h-3 w-3 inline mr-1" />
                  Sistema antifraude: respostas do mesmo IP ou a menos de 25m de outra resposta válida
                  serão marcadas como inválidas automaticamente.
                </p>
              </div>

              <CardFooter className="flex justify-end">
                <Button type="submit" className="w-full sm:w-auto" size="lg" loading={submitting} disabled={submitResult?.success}>
                  {submitting ? <Loader2 className="h-4 w-4" /> : 'Enviar Resposta'}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>Protegido por sistema antifraude baseado em IP e geolocalização</p>
        </div>
      </div>
    </div>
  );
}