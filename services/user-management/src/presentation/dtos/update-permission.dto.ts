// src/admin/dtos/update-permission.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePermissionDto {
  @ApiProperty({
    description: 'The action of the permission',
    example: 'create:user',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({
    description: 'The resource to which the action applies',
    example: 'User',
  })
  @IsOptional()
  @IsString()
  resource?: string;
}
