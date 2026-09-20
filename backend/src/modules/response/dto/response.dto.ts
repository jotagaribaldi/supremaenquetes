import {
  IsString,
  IsOptional,
  IsUUID,
  IsLatitude,
  IsLongitude,
  IsIn,
  IsIP,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResponseDto {
  @ApiProperty({ example: 'uuid-da-enquete' })
  @IsUUID()
  surveyId: string;

  @ApiProperty({ example: 'São Paulo', required: false, description: 'Será preenchido automaticamente via GPS' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Masculino', enum: ['Masculino', 'Feminino'] })
  @IsIn(['Masculino', 'Feminino'])
  gender: string;

  @ApiProperty({ example: '25-34', enum: ['16-24', '25-34', '35-44', '45-59', '60+'] })
  @IsIn(['16-24', '25-34', '35-44', '45-59', '60+'])
  ageRange: string;

  @ApiProperty({ example: 'Ensino Superior', enum: ['Ensino Fundamental', 'Ensino Médio', 'Ensino Superior'] })
  @IsIn(['Ensino Fundamental', 'Ensino Médio', 'Ensino Superior'])
  education: string;

  @ApiProperty({ example: 'Sim', enum: ['Sim', 'Não'] })
  @IsIn(['Sim', 'Não'])
  tocantinsVote: string;

  @ApiProperty({ example: 'Candidato A', required: false })
  @IsOptional()
  @IsString()
  governorVote?: string;

  @ApiProperty({ example: 'Candidato A', required: false, description: 'Candidato que NÃO votaria em hipótese alguma' })
  @IsOptional()
  @IsString()
  governorRejection?: string;

  @ApiProperty({ example: 'Candidato B', required: false })
  @IsOptional()
  @IsString()
  presidentVote?: string;

  @ApiProperty({ example: 'Candidato B', required: false, description: 'Candidato que NÃO votaria em hipótese alguma' })
  @IsOptional()
  @IsString()
  presidentRejection?: string;

  @ApiProperty({ example: 'Candidato C', required: false })
  @IsOptional()
  @IsString()
  senatorVote?: string;

  @ApiProperty({ example: 'Candidato C2', required: false })
  @IsOptional()
  @IsString()
  senatorVote2?: string;

  @ApiProperty({ example: 'Candidato D', required: false })
  @IsOptional()
  @IsString()
  stateDeputyVote?: string;

  @ApiProperty({ example: 'Candidato E', required: false })
  @IsOptional()
  @IsString()
  federalDeputyVote?: string;

  @ApiProperty({ example: '192.168.1.1' })
  @IsIP()
  ipAddress: string;

  @ApiProperty({ example: -23.5505 })
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: -46.6333 })
  @IsLongitude()
  longitude: number;
}