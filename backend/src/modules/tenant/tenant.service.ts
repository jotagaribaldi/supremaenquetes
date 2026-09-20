import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async findAll(userRole: string, userTenantId?: string) {
    if (userRole === 'admin') {
      return this.prisma.tenants.findMany({
        include: {
          _count: { select: { users: true, surveys: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.tenants.findMany({
      where: { id: userTenantId },
      include: {
        _count: { select: { users: true, surveys: true } },
      },
    });
  }

  async findById(id: string, userRole: string, userTenantId?: string) {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        surveys: { select: { id: true, title: true, createdAt: true } },
        _count: { select: { users: true, surveys: true } },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    if (userRole !== 'admin' && userTenantId !== id) {
      throw new ForbiddenException('Acesso negado');
    }

    return tenant;
  }

  async updatePlan(id: string, plan: string, userRole: string) {
    if (userRole !== 'admin') {
      throw new ForbiddenException('Apenas admins podem alterar planos');
    }

    return this.prisma.tenants.update({
      where: { id },
      data: { plan },
    });
  }

  async getUsageStats(tenantId: string) {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      include: {
        surveys: {
          include: {
            _count: { select: { responses: true } },
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    const totalResponses = tenant.surveys.reduce(
      (acc: number, survey) => acc + survey._count.responses,
      0,
    );

    const limits = {
      free: 100,
      pro: -1,
      enterprise: -1,
    };

    return {
      plan: tenant.plan,
      totalSurveys: tenant.surveys.length,
      totalResponses,
      limit: limits[tenant.plan as keyof typeof limits] || 100,
      remaining:
        limits[tenant.plan as keyof typeof limits] === -1
          ? 'Ilimitado'
          : Math.max(0, limits[tenant.plan as keyof typeof limits] - totalResponses),
    };
  }
}