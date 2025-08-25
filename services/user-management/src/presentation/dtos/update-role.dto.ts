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
  
  // --- ADD THIS NEW PROPERTY ---
  @ApiProperty({
    description: 'An array of permission UUIDs to assign to the role.',
    example: ['uuid-1', 'uuid-2'],
    required: false,
  })
  @IsArray()
  @IsUUID('4', { each: true }) // Validates that each item in the array is a UUID
  @IsOptional()
  permissions?: string[];
  // --- END OF NEW PROPERTY ---
}