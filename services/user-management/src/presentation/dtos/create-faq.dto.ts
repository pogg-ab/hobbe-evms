// src/presentation/dtos/create-faq.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateFaqDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
