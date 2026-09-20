import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CandidateService } from './candidate.service';

@ApiTags('Candidatos')
@Controller('candidates')
export class CandidateController {
  constructor(private candidateService: CandidateService) {}

  @Get()
  @ApiOperation({ summary: 'Listar candidatos por estado e cargo' })
  @ApiQuery({ name: 'state', required: true, description: 'UF do estado (ex: TO)' })
  @ApiQuery({ name: 'cargoCode', required: true, description: 'Código do cargo (3=Governador, 5=Senador, 6=Dep. Federal, 7=Dep. Estadual)' })
  async findByStateAndCargo(
    @Query('state') state: string,
    @Query('cargoCode') cargoCode: number,
  ) {
    return this.candidateService.findByStateAndCargo(state.toUpperCase(), cargoCode);
  }

  @Get('cargos')
  @ApiOperation({ summary: 'Listar códigos de cargo disponíveis' })
  async getCargos() {
    return this.candidateService.getCargos();
  }

  @Get('survey/:surveyId')
  @ApiOperation({ summary: 'Listar candidatos para uma enquete específica (filtrado pelo estado da enquete)' })
  async findBySurvey(@Param('surveyId') surveyId: string) {
    return this.candidateService.findBySurvey(surveyId);
  }
}