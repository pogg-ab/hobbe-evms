// src/presentation/dtos/create-faq.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateFaqDto {

  @ApiProperty({ example: 'How do I reset my password?', description: 'FAQ title' })  
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'You can reset your password by going to Settings > Security.',
    description: 'FAQ content / answer (markdown allowed)',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ example: ['account', 'security'], description: 'Tags for filtering', required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
