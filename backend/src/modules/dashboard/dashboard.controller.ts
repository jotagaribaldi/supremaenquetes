import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('survey/:surveyId/overview')
  @ApiOperation({ summary: 'Visão geral da enquete' })
  async getOverview(@Param('surveyId') surveyId: string, @Request() req: any) {
    return this.dashboardService.getOverview(surveyId, req.user.role, req.user.tenantId);
  }

  @Get('survey/:surveyId/votes')
  @ApiOperation({ summary: 'Distribuição de votos por cargo' })
  async getVotes(@Param('surveyId') surveyId: string, @Request() req: any) {
    return this.dashboardService.getVoteDistribution(surveyId, req.user.role, req.user.tenantId);
  }

  @Get('survey/:surveyId/demographics')
  @ApiOperation({ summary: 'Dados demográficos' })
  async getDemographics(@Param('surveyId') surveyId: string, @Request() req: any) {
    return this.dashboardService.getDemographics(surveyId, req.user.role, req.user.tenantId);
  }

  @Get('survey/:surveyId/geo')
  @ApiOperation({ summary: 'Dados geográficos para mapa' })
  async getGeo(@Param('surveyId') surveyId: string, @Request() req: any) {
    return this.dashboardService.getGeoData(surveyId, req.user.role, req.user.tenantId);
  }

  @Get('survey/:surveyId/timeseries')
  @ApiOperation({ summary: 'Série temporal de respostas' })
  async getTimeSeries(@Param('surveyId') surveyId: string, @Request() req: any) {
    return this.dashboardService.getTimeSeries(surveyId, req.user.role, req.user.tenantId);
  }
}