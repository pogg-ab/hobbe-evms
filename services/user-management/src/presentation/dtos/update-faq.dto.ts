// src/presentation/dtos/update-faq.dto.ts
import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateFaqDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
