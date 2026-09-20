import { Controller, Get, Param, Patch, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tenants' })
  @ApiQuery({ name: 'tenantId', required: false })
  async findAll(@Request() req: any, @Query('tenantId') tenantId?: string) {
    return this.tenantService.findAll(req.user.role, req.user.tenantId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Obter estatísticas de uso do tenant' })
  async getUsage(@Request() req: any) {
    return this.tenantService.getUsageStats(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter tenant por ID' })
  async findById(@Param('id') id: string, @Request() req: any) {
    return this.tenantService.findById(id, req.user.role, req.user.tenantId);
  }

  @Patch(':id/plan')
  @ApiOperation({ summary: 'Atualizar plano do tenant (apenas admin)' })
  async updatePlan(
    @Param('id') id: string,
    @Body('plan') plan: string,
    @Request() req: any,
  ) {
    return this.tenantService.updatePlan(id, plan, req.user.role);
  }
}