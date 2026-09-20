import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    tenantId?: string;
  }) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const tenantApi = {
  list: () => api.get('/tenants'),
  getUsage: () => api.get('/tenants/usage'),
  getById: (id: string) => api.get(`/tenants/${id}`),
  updatePlan: (id: string, plan: string) => api.patch(`/tenants/${id}/plan`, { plan }),
};

export const surveyApi = {
  list: (tenantId?: string) =>
    api.get('/surveys', { params: { tenantId } }),
  create: (data: { title: string; state?: string; tenantId?: string }) =>
    api.post('/surveys', data),
  getPublic: (id: string) => api.get(`/surveys/public/${id}`),
  getById: (id: string) => api.get(`/surveys/${id}`),
  update: (id: string, data: { title?: string; state?: string }) => api.patch(`/surveys/${id}`, data),
  delete: (id: string) => api.delete(`/surveys/${id}`),
};

export const responseApi = {
  create: (data: any) => api.post('/responses', data),
  listBySurvey: (surveyId: string, includeInvalid?: boolean) =>
    api.get(`/responses/survey/${surveyId}`, { params: { includeInvalid } }),
  listAllBySurvey: (surveyId: string) => api.get(`/responses/survey/${surveyId}/all`),
  getCounts: (surveyId: string) => api.get(`/responses/survey/${surveyId}/counts`),
};

export const candidateApi = {
  listByStateAndCargo: (state: string, cargoCode: number) =>
    api.get('/candidates', { params: { state, cargoCode } }),
  getCargos: () => api.get('/candidates/cargos'),
  listBySurvey: (surveyId: string) => api.get(`/candidates/survey/${surveyId}`),
};

export const dashboardApi = {
  getOverview: (surveyId: string) => api.get(`/dashboard/survey/${surveyId}/overview`),
  getVotes: (surveyId: string) => api.get(`/dashboard/survey/${surveyId}/votes`),
  getDemographics: (surveyId: string) => api.get(`/dashboard/survey/${surveyId}/demographics`),
  getGeo: (surveyId: string) => api.get(`/dashboard/survey/${surveyId}/geo`),
  getTimeSeries: (surveyId: string) => api.get(`/dashboard/survey/${surveyId}/timeseries`),
};