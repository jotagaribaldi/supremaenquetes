import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateResponseDto } from './dto/response.dto';
import { haversineDistance, MIN_DISTANCE_METERS, reverseGeocode, isInState } from '../../common/utils/geo.utils';

@Injectable()
export class ResponseService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateResponseDto) {
    const survey = await this.prisma.surveys.findUnique({
      where: { id: dto.surveyId },
      include: { tenants: true },
    });

    if (!survey) {
      throw new NotFoundException('Enquete não encontrada');
    }

    if (!survey.tenantId) {
      throw new ForbiddenException('Enquete sem tenant associado');
    }

    const tenantUsage = await this.checkTenantLimit(survey.tenantId);
    if (!tenantUsage.canCreate) {
      throw new ForbiddenException(`Limite de respostas atingido para o plano ${survey.tenants?.plan}`);
    }

    const existingByIp = await this.prisma.responses.findFirst({
      where: {
        surveyId: dto.surveyId,
        ipAddress: dto.ipAddress,
      },
    });

    let isValid = true;
    let invalidReason = null;

    const geoInfo = await reverseGeocode(dto.latitude, dto.longitude);
    const city = geoInfo.city;
    const userStateCode = geoInfo.stateCode;

    if (survey.state && !isInState(dto.latitude, dto.longitude, survey.state)) {
      isValid = false;
      invalidReason = `Fora do estado da pesquisa (${survey.state}) - Usuário em ${userStateCode}`;
    } else if (existingByIp) {
      isValid = false;
      invalidReason = 'Same IP address';
    } else {
      const nearbyResponses = await this.prisma.responses.findMany({
        where: {
          surveyId: dto.surveyId,
          isValid: true,
        },
        select: { latitude: true, longitude: true },
      });

      for (const resp of nearbyResponses) {
        const distance = haversineDistance(
          dto.latitude,
          dto.longitude,
          Number(resp.latitude),
          Number(resp.longitude),
        );

        if (distance < MIN_DISTANCE_METERS) {
          isValid = false;
          invalidReason = `Distance < ${MIN_DISTANCE_METERS}m (${distance.toFixed(2)}m)`;
          break;
        }
      }
    }

    const response = await this.prisma.responses.create({
      data: {
        surveyId: dto.surveyId,
        city,
        tocantinsVote: dto.tocantinsVote,
        gender: dto.gender,
        ageRange: dto.ageRange,
        education: dto.education,
        governorVote: dto.governorVote,
        governorRejection: dto.governorRejection,
        governorEvaluation: dto.governorEvaluation,
        presidentVote: dto.presidentVote,
        presidentRejection: dto.presidentRejection,
        presidentEvaluation: dto.presidentEvaluation,
        senatorVote: dto.senatorVote,
        senatorVote2: dto.senatorVote2,
        stateDeputyVote: dto.stateDeputyVote,
        stateDeputyReelectionRejection: dto.stateDeputyReelectionRejection,
        federalDeputyVote: dto.federalDeputyVote,
        ipAddress: dto.ipAddress,
        latitude: dto.latitude,
        longitude: dto.longitude,
        isValid: isValid,
      },
    });

    return {
      ...response,
      isValid,
      invalidReason,
      message: isValid
        ? 'Resposta registrada com sucesso'
        : `Resposta registrada, mas marcada como inválida: ${invalidReason}`,
    };
  }

  async findBySurvey(
    surveyId: string,
    userRole: string,
    userTenantId?: string,
    onlyValid = true,
  ) {
    const survey = await this.prisma.surveys.findUnique({ where: { id: surveyId } });
    if (!survey) {
      throw new NotFoundException('Enquete não encontrada');
    }

    if (userRole !== 'admin' && survey.tenantId !== userTenantId) {
      throw new ForbiddenException('Acesso negado');
    }

    return this.prisma.responses.findMany({
      where: {
        surveyId: surveyId,
        ...(onlyValid ? { isValid: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllBySurvey(surveyId: string, userRole: string, userTenantId?: string) {
    return this.findBySurvey(surveyId, userRole, userTenantId, false);
  }

  async getValidCount(surveyId: string) {
    return this.prisma.responses.count({
      where: { surveyId: surveyId, isValid: true },
    });
  }

  async getInvalidCount(surveyId: string) {
    return this.prisma.responses.count({
      where: { surveyId: surveyId, isValid: false },
    });
  }

  async getResults(surveyId: string) {
    const responses = await this.prisma.responses.findMany({
      where: {
        surveyId,
        isValid: true,
      },
    });

    const totalResponses = responses.length;

    const countField = (field: string) => {
      const counts: Record<string, number> = {};
      responses.forEach(r => {
        const value = (r as any)[field];
        if (value && value.trim()) {
          counts[value] = (counts[value] || 0) + 1;
        }
      });
      return Object.entries(counts)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);
    };

    // Governor vote by gender breakdown
    const governorByGender: Record<string, { Masculino: number; Feminino: number }> = {};
    responses.forEach(r => {
      const vote = r.governorVote;
      const gender = r.gender;
      if (vote && vote.trim() && gender && gender.trim()) {
        if (!governorByGender[vote]) {
          governorByGender[vote] = { Masculino: 0, Feminino: 0 };
        }
        if (gender === 'Masculino' || gender === 'Feminino') {
          governorByGender[vote][gender]++;
        }
      }
    });

    const governorByGenderArray = Object.entries(governorByGender)
      .map(([candidate, counts]) => ({
        candidate,
        masculino: counts.Masculino,
        feminino: counts.Feminino,
        total: counts.Masculino + counts.Feminino,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      totalResponses,
      governor: countField('governorVote'),
      president: countField('presidentVote'),
      senator: countField('senatorVote'),
      federalDeputy: countField('federalDeputyVote'),
      stateDeputy: countField('stateDeputyVote'),
      gender: countField('gender'),
      ageRange: countField('ageRange'),
      education: countField('education'),
      presidentEvaluation: countField('presidentEvaluation'),
      governorEvaluation: countField('governorEvaluation'),
      tocantinsVote: countField('tocantinsVote'),
      stateDeputyReelectionRejection: countField('stateDeputyReelectionRejection'),
      governorByGender: governorByGenderArray,
    };
  }

  private async checkTenantLimit(tenantId: string) {
    const tenant = await this.prisma.tenants.findUnique({ where: { id: tenantId } });
    if (!tenant) return { canCreate: true };

    const totalResponses = await this.prisma.responses.count({
      where: {
        surveys: { tenantId: tenantId },
        isValid: true,
      },
    });

    const limits = { free: 100, pro: -1, enterprise: -1 };
    const limit = limits[tenant.plan as keyof typeof limits] || 100;

    return {
      canCreate: limit === -1 || totalResponses < limit,
      totalResponses,
      limit,
    };
  }
}