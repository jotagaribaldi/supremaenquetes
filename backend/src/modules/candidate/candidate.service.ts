import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CandidateService {
  constructor(private prisma: PrismaService) {}

  private deduplicateByCandidateNumber(candidates: any[]) {
    const seen = new Set<number>();
    return candidates.filter((c) => {
      if (seen.has(c.candidateNumber)) {
        return false;
      }
      seen.add(c.candidateNumber);
      return true;
    });
  }

  async findByStateAndCargo(state: string, cargoCode: number) {
    const candidates = await this.prisma.candidates.findMany({
      where: {
        state: state.toUpperCase(),
        cargoCode,
      },
      select: {
        id: true,
        candidateNumber: true,
        name: true,
        urnName: true,
        partyNumber: true,
        partyAcronym: true,
        partyName: true,
        coalitionName: true,
        federationName: true,
        situation: true,
      },
      orderBy: { candidateNumber: 'asc' },
    });

    return this.deduplicateByCandidateNumber(candidates);
  }

  async getCargos() {
    return [
      { code: 1, name: 'PRESIDENTE' },
      { code: 3, name: 'GOVERNADOR' },
      { code: 5, name: 'SENADOR' },
      { code: 6, name: 'DEPUTADO FEDERAL' },
      { code: 7, name: 'DEPUTADO ESTADUAL' },
    ];
  }

  async findBySurvey(surveyId: string) {
    const survey = await this.prisma.surveys.findUnique({
      where: { id: surveyId },
      select: { state: true },
    });

    if (!survey) {
      throw new NotFoundException('Enquete não encontrada');
    }

    if (!survey.state) {
      return {
        president: [],
        governor: [],
        senator: [],
        federalDeputy: [],
        stateDeputy: [],
      };
    }

    const [president, governor, senator, federalDeputy, stateDeputy] = await Promise.all([
      this.findByStateAndCargo(survey.state, 1),
      this.findByStateAndCargo(survey.state, 3),
      this.findByStateAndCargo(survey.state, 5),
      this.findByStateAndCargo(survey.state, 6),
      this.findByStateAndCargo(survey.state, 7),
    ]);

    return {
      president,
      governor,
      senator,
      federalDeputy,
      stateDeputy,
    };
  }
}