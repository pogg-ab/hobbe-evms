import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ example: 'New Role Name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'New description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'An array of permission UUIDs to assign to the role.',
    example: ['uuid-1', 'uuid-2'],
    required: false,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  permissions?: string[];
}
