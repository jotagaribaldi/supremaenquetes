export interface Tenant {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    surveys: number;
  };
}

export interface Survey {
  id: string;
  title: string;
  tenantId: string;
  tenant?: Tenant;
  createdAt: string;
  updatedAt: string;
  _count?: {
    responses: number;
  };
}

export interface Response {
  id: string;
  surveyId: string;
  city: string;
  gender: 'Masculino' | 'Feminino';
  ageRange: '16-24' | '25-34' | '35-44' | '45-59' | '60+';
  education: 'Ensino Fundamental' | 'Ensino Médio' | 'Ensino Superior';
  governorVote?: string;
  presidentVote?: string;
  senatorVote?: string;
  stateDeputyVote?: string;
  federalDeputyVote?: string;
  ipAddress: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  isValid: boolean;
}

export interface DashboardOverview {
  survey: { id: string; title: string };
  totalResponses: number;
  validResponses: number;
  invalidResponses: number;
  validityRate: string;
}

export interface VoteDistribution {
  governor: { name: string; value: number }[];
  president: { name: string; value: number }[];
  senator: { name: string; value: number }[];
  stateDeputy: { name: string; value: number }[];
  federalDeputy: { name: string; value: number }[];
}

export interface Demographics {
  gender: { name: string; value: number }[];
  ageRange: { name: string; value: number }[];
  education: { name: string; value: number }[];
  cities: { name: string; value: number }[];
}

export interface GeoPoint {
  lat: number;
  lng: number;
  city: string;
  date: string;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}