// src/application/dtos/review-verification.dto.ts
import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VerificationStatus } from '../../domain/entities/verification-request.entity';

export class ReviewVerificationDto {
  @ApiProperty({ enum: VerificationStatus })
  @IsIn([VerificationStatus.APPROVED, VerificationStatus.REJECTED])
  decision: VerificationStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string | null;
}
