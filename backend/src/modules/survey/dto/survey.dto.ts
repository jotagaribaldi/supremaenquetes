import { IsString, IsOptional, IsUUID, Length, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSurveyDto {
  @ApiProperty({ example: 'Enquete Eleitoral 2024 - Tocantins' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'uuid-do-tenant', required: false })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiProperty({ example: 'TO', description: 'Estado da pesquisa (UF)', required: false })
  @IsOptional()
  @Length(2, 2, { message: 'Estado deve ter 2 caracteres (UF)' })
  state?: string;

  @ApiProperty({ example: 1, description: 'Tipo da enquete: 1 = 1º turno, 2 = 2º turno', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2)
  type?: number;
}

export class UpdateSurveyDto {
  @ApiProperty({ example: 'Enquete Eleitoral 2024 - Tocantins Atualizada', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'TO', description: 'Estado da pesquisa (UF)', required: false })
  @IsOptional()
  @Length(2, 2, { message: 'Estado deve ter 2 caracteres (UF)' })
  state?: string;

  @ApiProperty({ example: 1, description: 'Tipo da enquete: 1 = 1º turno, 2 = 2º turno', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2)
  type?: number;
}