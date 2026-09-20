import {
  IsString,
  IsOptional,
  IsUUID,
  IsLatitude,
  IsLongitude,
  IsIn,
  IsIP,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum VoteType {
  CANDIDATE = 'CANDIDATE',
  NULL_BLANK = 'NULL_BLANK',
  UNDECIDED = 'UNDECIDED',
}

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

  @ApiProperty({ enum: VoteType, default: VoteType.CANDIDATE, required: false })
  @IsOptional()
  @IsEnum(VoteType)
  governorVoteType?: VoteType;

  @ApiProperty({ example: 'Candidato B', required: false })
  @IsOptional()
  @IsString()
  presidentVote?: string;

  @ApiProperty({ enum: VoteType, default: VoteType.CANDIDATE, required: false })
  @IsOptional()
  @IsEnum(VoteType)
  presidentVoteType?: VoteType;

  @ApiProperty({ example: 'Candidato C', required: false })
  @IsOptional()
  @IsString()
  senatorVote?: string;

  @ApiProperty({ enum: VoteType, default: VoteType.CANDIDATE, required: false })
  @IsOptional()
  @IsEnum(VoteType)
  senatorVoteType?: VoteType;

  @ApiProperty({ example: 'Candidato D', required: false })
  @IsOptional()
  @IsString()
  stateDeputyVote?: string;

  @ApiProperty({ enum: VoteType, default: VoteType.CANDIDATE, required: false })
  @IsOptional()
  @IsEnum(VoteType)
  stateDeputyVoteType?: VoteType;

  @ApiProperty({ example: 'Candidato E', required: false })
  @IsOptional()
  @IsString()
  federalDeputyVote?: string;

  @ApiProperty({ enum: VoteType, default: VoteType.CANDIDATE, required: false })
  @IsOptional()
  @IsEnum(VoteType)
  federalDeputyVoteType?: VoteType;

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