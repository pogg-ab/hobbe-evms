import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: 'The name of the role', example: 'Admin' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'A brief description of the role',
    example: 'Administrator with full access',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'An array of permission associated with the role',
    example: ['permission1', 'permission2'],
  })
  @IsArray()
  @IsOptional()
  @IsUUID('all', { each: true })
  permissions?: string[];
}
