import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSurveyDto, UpdateSurveyDto } from './dto/survey.dto';

@Injectable()
export class SurveyService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSurveyDto, userId: string, userRole: string, userTenantId?: string) {
    let tenantId = dto.tenantId;

    if (userRole !== 'admin') {
      tenantId = userTenantId;
    }

    if (!tenantId) {
      throw new ForbiddenException('Tenant ID é obrigatório');
    }

    const tenant = await this.prisma.tenants.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return this.prisma.surveys.create({
      data: {
        title: dto.title,
        tenantId,
        state: dto.state?.toUpperCase(),
      },
    });
  }

  async findAll(userRole: string, userTenantId?: string, tenantId?: string) {
    const where: any = {};

    if (userRole !== 'admin') {
      where.tenantId = userTenantId;
    } else if (tenantId) {
      where.tenantId = tenantId;
    }

    return this.prisma.surveys.findMany({
      where,
      include: {
        tenants: { select: { id: true, name: true } },
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userRole: string, userTenantId?: string) {
    const survey = await this.prisma.surveys.findUnique({
      where: { id },
      include: {
        tenants: { select: { id: true, name: true, plan: true } },
        _count: { select: { responses: true } },
      },
    });

    if (!survey) {
      throw new NotFoundException('Enquete não encontrada');
    }

    if (userRole !== 'admin' && survey.tenantId !== userTenantId) {
      throw new ForbiddenException('Acesso negado a esta enquete');
    }

    return survey;
  }

  async update(id: string, dto: UpdateSurveyDto, userRole: string, userTenantId?: string) {
    const survey = await this.findById(id, userRole, userTenantId);

    const updateData: any = { ...dto };
    if (dto.state) {
      updateData.state = dto.state.toUpperCase();
    }

    return this.prisma.surveys.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, userRole: string, userTenantId?: string) {
    await this.findById(id, userRole, userTenantId);

    return this.prisma.surveys.delete({ where: { id } });
  }

  async getPublicSurvey(id: string) {
    const survey = await this.prisma.surveys.findUnique({
      where: { id },
      select: { id: true, title: true, tenantId: true, state: true },
    });

    if (!survey) {
      throw new NotFoundException('Enquete não encontrada');
    }

    return survey;
  }
}