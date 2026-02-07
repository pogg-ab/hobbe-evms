// src/presentation/dtos/update-faq.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateFaqDto {

  @ApiProperty({ example: 'How do I change my email?', required: false })  
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'You can change your email by going to Settings > Account.', required: false })
  @IsOptional()
  @IsString()
  content?: string;

   @ApiProperty({ example: ['account', 'email'], required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
