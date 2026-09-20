import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview(surveyId: string, userRole: string, userTenantId?: string) {
    const survey = await this.prisma.surveys.findUnique({
      where: { id: surveyId },
      include: { tenants: true },
    });

    if (!survey) {
      throw new NotFoundException('Enquete não encontrada');
    }

    if (userRole !== 'admin' && survey.tenantId !== userTenantId) {
      throw new ForbiddenException('Acesso negado');
    }

    const [validResponses, invalidResponses, totalResponses] = await Promise.all([
      this.prisma.responses.count({ where: { surveyId: surveyId, isValid: true } }),
      this.prisma.responses.count({ where: { surveyId: surveyId, isValid: false } }),
      this.prisma.responses.count({ where: { surveyId: surveyId } }),
    ]);

    return {
      survey: { id: survey.id, title: survey.title },
      totalResponses,
      validResponses,
      invalidResponses,
      validityRate: totalResponses > 0 ? ((validResponses / totalResponses) * 100).toFixed(2) : 0,
    };
  }

  async getVoteDistribution(surveyId: string, userRole: string, userTenantId?: string) {
    const survey = await this.prisma.surveys.findUnique({ where: { id: surveyId } });
    if (!survey) throw new NotFoundException('Enquete não encontrada');
    if (userRole !== 'admin' && survey.tenantId !== userTenantId) {
      throw new ForbiddenException('Acesso negado');
    }

    const responses = await this.prisma.responses.findMany({
      where: { surveyId: surveyId, isValid: true },
      select: {
        governorVote: true,
        presidentVote: true,
        senatorVote: true,
        stateDeputyVote: true,
        federalDeputyVote: true,
      },
    });

    const countVotes = (field: string) => {
      const counts: Record<string, number> = {};
      responses.forEach((r) => {
        const vote = (r as any)[field];
        if (vote) {
          counts[vote] = (counts[vote] || 0) + 1;
        }
      });
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    };

    return {
      governor: countVotes('governorVote'),
      president: countVotes('presidentVote'),
      senator: countVotes('senatorVote'),
      stateDeputy: countVotes('stateDeputyVote'),
      federalDeputy: countVotes('federalDeputyVote'),
    };
  }

  async getDemographics(surveyId: string, userRole: string, userTenantId?: string) {
    const survey = await this.prisma.surveys.findUnique({ where: { id: surveyId } });
    if (!survey) throw new NotFoundException('Enquete não encontrada');
    if (userRole !== 'admin' && survey.tenantId !== userTenantId) {
      throw new ForbiddenException('Acesso negado');
    }

    const responses = await this.prisma.responses.findMany({
      where: { surveyId: surveyId, isValid: true },
      select: { gender: true, ageRange: true, education: true, city: true },
    });

    const countField = (field: string) => {
      const counts: Record<string, number> = {};
      responses.forEach((r) => {
        const val = (r as any)[field];
        if (val) counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    };

    return {
      gender: countField('gender'),
      ageRange: countField('ageRange'),
      education: countField('education'),
      cities: countField('city'),
    };
  }

  async getGeoData(surveyId: string, userRole: string, userTenantId?: string) {
    const survey = await this.prisma.surveys.findUnique({ where: { id: surveyId } });
    if (!survey) throw new NotFoundException('Enquete não encontrada');
    if (userRole !== 'admin' && survey.tenantId !== userTenantId) {
      throw new ForbiddenException('Acesso negado');
    }

    const responses = await this.prisma.responses.findMany({
      where: { surveyId: surveyId, isValid: true },
      select: { latitude: true, longitude: true, city: true, createdAt: true },
    });

    return responses.map((r) => ({
      lat: Number(r.latitude),
      lng: Number(r.longitude),
      city: r.city,
      date: r.createdAt,
    }));
  }

  async getTimeSeries(surveyId: string, userRole: string, userTenantId?: string) {
    const survey = await this.prisma.surveys.findUnique({ where: { id: surveyId } });
    if (!survey) throw new NotFoundException('Enquete não encontrada');
    if (userRole !== 'admin' && survey.tenantId !== userTenantId) {
      throw new ForbiddenException('Acesso negado');
    }

    const responses = await this.prisma.responses.findMany({
      where: { surveyId: surveyId, isValid: true },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyCounts: Record<string, number> = {};
    responses.forEach((r) => {
      if (r.createdAt) {
        const date = r.createdAt.toISOString().split('T')[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      }
    });

    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}