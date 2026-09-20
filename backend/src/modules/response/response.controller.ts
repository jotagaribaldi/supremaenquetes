import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ResponseService } from './response.service';
import { CreateResponseDto } from './dto/response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Respostas')
@Controller('responses')
export class ResponseController {
  constructor(private responseService: ResponseService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar resposta para enquete (público)' })
  async create(@Body() dto: CreateResponseDto) {
    return this.responseService.create(dto);
  }

  @Get('survey/:surveyId')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar respostas válidas de uma enquete' })
  @ApiQuery({ name: 'includeInvalid', required: false, type: Boolean })
  async findBySurvey(
    @Param('surveyId') surveyId: string,
    @Request() req: any,
    @Query('includeInvalid') includeInvalid?: boolean,
  ) {
    return this.responseService.findBySurvey(
      surveyId,
      req.user.role,
      req.user.tenantId,
      !includeInvalid,
    );
  }

  @Get('survey/:surveyId/all')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas respostas (válidas e inválidas) de uma enquete' })
  async findAllBySurvey(@Param('surveyId') surveyId: string, @Request() req: any) {
    return this.responseService.findAllBySurvey(surveyId, req.user.role, req.user.tenantId);
  }

  @Get('survey/:surveyId/counts')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter contagem de respostas válidas e inválidas' })
  async getCounts(@Param('surveyId') surveyId: string, @Request() req: any) {
    const [valid, invalid] = await Promise.all([
      this.responseService.getValidCount(surveyId),
      this.responseService.getInvalidCount(surveyId),
    ]);
    return { valid, invalid, total: valid + invalid };
  }
}