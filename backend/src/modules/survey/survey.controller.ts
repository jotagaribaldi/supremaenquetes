import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SurveyService } from './survey.service';
import { CreateSurveyDto, UpdateSurveyDto } from './dto/survey.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Enquetes')
@Controller('surveys')
export class SurveyController {
  constructor(private surveyService: SurveyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova enquete' })
  async create(@Body() dto: CreateSurveyDto, @Request() req: any) {
    return this.surveyService.create(dto, req.user.id, req.user.role, req.user.tenantId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar enquetes do usuário' })
  @ApiQuery({ name: 'tenantId', required: false })
  async findAll(@Request() req: any, @Query('tenantId') tenantId?: string) {
    return this.surveyService.findAll(req.user.role, req.user.tenantId, tenantId);
  }

  @Get('public/:id')
  @ApiOperation({ summary: 'Obter enquete pública (para formulário de resposta)' })
  async getPublic(@Param('id') id: string) {
    return this.surveyService.getPublicSurvey(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter enquete por ID' })
  async findById(@Param('id') id: string, @Request() req: any) {
    return this.surveyService.findById(id, req.user.role, req.user.tenantId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar enquete' })
  async update(@Param('id') id: string, @Body() dto: UpdateSurveyDto, @Request() req: any) {
    return this.surveyService.update(id, dto, req.user.role, req.user.tenantId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir enquete' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.surveyService.delete(id, req.user.role, req.user.tenantId);
  }
}