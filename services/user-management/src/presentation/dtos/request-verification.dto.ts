// src/application/dtos/request-verification.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestVerificationDto {
  @ApiProperty({ description: 'Reason for verification', example: 'I am a public figure and want verified.' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Stored path or id for national ID image (string)', example: 'public/uploads/national_id/xxx.jpg' })
  @IsNotEmpty()
  @IsString()
  nationalIdImage: string;
}
