# Suprema Enquetes - Plataforma de Enquetes Eleitorais

Micro SaaS para realização de enquetes eleitorais georreferenciadas com controle antifraude baseado em IP e geolocalização (distância mínima de 25m).

## 🚀 Stack Tecnológica

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS** + ShadCN UI style components
- **React Hook Form** + Zod (validação)
- **Zustand** (estado global)
- **Recharts** (gráficos)
- **React Leaflet** (mapas)

### Backend
- **NestJS** (arquitetura modular)
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL** (com Haversine formula para distância)
- **JWT** (autenticação)
- **Swagger** (documentação API)

### Infraestrutura
- **Docker** + **Docker Compose**
- **Nginx** (reverse proxy + rate limiting)
- **Deploy pronto para VPS**

## 📋 Funcionalidades Principais

### 🔐 Sistema Multi-tenant (SaaS)
- Cadastro e login com JWT
- Perfis: Admin (plataforma) e Cliente (criador de enquetes)
- Isolamento lógico por `tenant_id`
- Planos: Free (100 respostas), Pro (ilimitado), Enterprise (API + exportação)

### 🗳️ Formulário de Enquete Eleitoral
- Cidade, Sexo, Faixa etária, Escolaridade
- Votos para: Governador, Presidente, Senador, Dep. Estadual, Dep. Federal
- Captura automática: IP, Geolocalização (lat/lng), Data/hora

### 🛡️ Antifraude (Diferencial)
- **Não bloqueia** o envio, apenas marca como inválido na análise
- Regras:
  - Mesmo IP → inválido
  - Distância < 25m de outra resposta válida → inválido
  - Primeira resposta de um IP/localização → válida
- Implementado com **fórmula de Haversine** (sem dependência de PostGIS)

### 📊 Dashboard e Relatórios
- Gráficos de intenção de voto por cargo
- Distribuições: Sexo, Faixa etária, Escolaridade, Cidades
- Mapa com pontos geográficos (heatmap)
- Filtros por cidade
- Série temporal de respostas
- Apenas respostas `is_valid = true` são consideradas

## 🏗️ Estrutura do Projeto

```
supremaenquetes/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── common/          # Guards, utils (Haversine)
│   │   ├── modules/
│   │   │   ├── auth/        # JWT Auth
│   │   │   ├── tenant/      # Multi-tenancy
│   │   │   ├── survey/      # CRUD Enquetes
│   │   │   ├── response/    # Respostas + Antifraude
│   │   │   └── dashboard/   # Analytics
│   │   └── prisma/          # Prisma Service
│   ├── prisma/schema.prisma # Database schema
│   └── Dockerfile
├── frontend/                # Next.js App
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── auth/        # Login/Register
│   │   │   ├── dashboard/   # Protected area
│   │   │   └── survey/[id]/ # Public survey form
│   │   ├── components/      # UI Components
│   │   ├── lib/             # API client, utils
│   │   ├── store/           # Zustand stores
│   │   └── types/           # TypeScript types
│   └── Dockerfile
├── nginx.conf               # Reverse proxy config
├── docker-compose.yml       # Orquestração
└── README.md
```

## 🗄️ Modelo do Banco de Dados

```sql
-- Tenants (clientes SaaS)
tenants: id, name, plan, created_at, updated_at

-- Usuários
users: id, name, email, password, role, tenant_id, created_at, updated_at

-- Enquetes
surveys: id, title, tenant_id, created_at, updated_at

-- Respostas
responses: id, survey_id, city, gender, age_range, education,
           governor_vote, president_vote, senator_vote,
           state_deputy_vote, federal_deputy_vote,
           ip_address, latitude, longitude, created_at, is_valid
```

## 🐳 Como Executar com Docker

### Pré-requisitos
- Docker 24+
- Docker Compose 2+
- Banco PostgreSQL acessível (configurado no `.env` do backend)

### 1. Configurar variáveis de ambiente

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://postgres:qwe@1215Jv@condominiolivre.com.br:5432/supremaenquetes?schema=public"
JWT_SECRET="sua-chave-secreta-super-segura"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. Subir containers

```bash
# Desenvolvimento
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Rebuild
docker-compose up -d --build
```

### 3. Acessar
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Swagger Docs**: http://localhost:3001/api/docs

## 💻 Desenvolvimento Local

### Backend
```bash
cd backend
npm install
npx prisma generate
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuração do Banco de Dados

As tabelas são criadas automaticamente via Prisma ou pelo script SQL. O banco deve ter a extensão `pgcrypto` para UUIDs:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Índices criados automaticamente:
- `idx_responses_survey_id`
- `idx_responses_ip`
- `idx_responses_created_at`
- `idx_surveys_tenant_id`
- `idx_users_tenant_id`

## 📡 Endpoints Principais da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuário logado

### Tenants
- `GET /api/tenants` - Listar tenants
- `GET /api/tenants/usage` - Estatísticas de uso
- `PATCH /api/tenants/:id/plan` - Alterar plano (admin)

### Enquetes
- `POST /api/surveys` - Criar enquete
- `GET /api/surveys` - Listar enquetes
- `GET /api/surveys/public/:id` - Enquete pública (formulário)
- `GET /api/surveys/:id` - Detalhes da enquete
- `PATCH /api/surveys/:id` - Atualizar
- `DELETE /api/surveys/:id` - Excluir

### Respostas
- `POST /api/responses` - Enviar resposta (público)
- `GET /api/responses/survey/:surveyId` - Respostas válidas
- `GET /api/responses/survey/:surveyId/all` - Todas respostas
- `GET /api/responses/survey/:surveyId/counts` - Contadores

### Dashboard
- `GET /api/dashboard/survey/:surveyId/overview` - Visão geral
- `GET /api/dashboard/survey/:surveyId/votes` - Distribuição de votos
- `GET /api/dashboard/survey/:surveyId/demographics` - Demografia
- `GET /api/dashboard/survey/:surveyId/geo` - Dados do mapa
- `GET /api/dashboard/survey/:surveyId/timeseries` - Série temporal

## 🛡️ Segurança

- **Rate Limiting**: 100 req/min global, 5 req/min login/register
- **JWT**: Expiração 7 dias, HttpOnly cookies
- **CORS**: Configurado para frontend
- **Helmet**: Headers de segurança
- **Validação**: Class-validator + Zod
- **Sanitização**: Prisma + class-transformer

## 💰 Modelo de Negócio (Micro SaaS)

| Plano | Respostas | Relatórios | API | Preço |
|-------|-----------|------------|-----|-------|
| Free | 100/mês | Básicos | ❌ | Grátis |
| Pro | Ilimitadas | Completos | ❌ | R$ 99/mês |
| Enterprise | Ilimitadas | Completos + Export | ✅ | R$ 299/mês |

### Feature Flags por Plano
- `free`: limite 100 respostas válidas
- `pro`: respostas ilimitadas
- `enterprise`: API key + exportação CSV/JSON

## 🚀 Deploy em VPS

1. **Clone o repositório**
2. **Configure `.env` de produção** (JWT_SECRET forte, URLs corretas)
3. **Configure SSL** (Let's Encrypt) no diretório `./ssl/`
4. **Ajuste `nginx.conf`** com seu domínio
5. **Execute**:
   ```bash
   docker-compose -f docker-compose.yml up -d --build
   ```

## 📝 Licença

Projeto proprietário - Suprema Enquetes © 2024