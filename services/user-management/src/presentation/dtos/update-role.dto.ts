// src/admin/dtos/update-role.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ description: 'The name of the role', example: 'Admin' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'A brief description of the role',
    example: 'Administrator with full access',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
