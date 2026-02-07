// src/application/dtos/verification-response.dto.ts
import { VerificationStatus } from '../../domain/entities/verification-request.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ReviewedByDto } from './reviewed-by.dto';

export class VerificationResponseDto {
  @ApiProperty()
  verificationRequestId: string;

  @ApiProperty()
  personalAccountId: string;

  @ApiProperty({ enum: VerificationStatus })
  status: VerificationStatus;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  nationalIdImage: string;

  @ApiProperty({ required: false })
  rejectionReason?: string | null;

  @ApiProperty()
  submittedAt: Date;

  @ApiProperty({ required: false })
  reviewedAt?: Date | null;

  @ApiProperty({ required: false, type: ReviewedByDto })
  reviewedBy?: ReviewedByDto | null;
}
