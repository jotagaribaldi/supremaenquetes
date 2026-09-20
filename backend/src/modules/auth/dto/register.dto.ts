import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'client', enum: ['admin', 'client'], required: false })
  @IsOptional()
  @IsEnum(['admin', 'client'])
  role?: string;

  @ApiProperty({ example: 'uuid-do-tenant', required: false })
  @IsOptional()
  @IsString()
  tenantId?: string;
}