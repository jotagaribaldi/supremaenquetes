'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Loader2, Shield, BarChart3, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [hydrate, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mx-auto mb-8 h-16 w-16 rounded-xl bg-primary-600 flex items-center justify-center">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Suprema Enquetes</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Plataforma de enquetes eleitorais georreferenciadas com controle antifraude
          por IP e geolocalização (25m mínimo).
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link href="/auth/login">
            <Button size="lg" className="w-full sm:w-auto">
              Entrar no Painel
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Criar Conta Grátis
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Completo</h3>
            <p className="text-gray-600">Visualize resultados em tempo real com gráficos de intenção de voto e demografia.</p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Geolocalização Precisa</h3>
            <p className="text-gray-600">Mapa de calor com pontos geográficos e validação de distância mínima de 25m.</p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-tenant SaaS</h3>
            <p className="text-gray-600">Planos Free, Pro e Enterprise com controle de uso e isolamento de dados por cliente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}