// src/application/mappers/verification.profile.ts
import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { RequestVerificationDto } from '../../presentation/dtos/request-verification.dto';
import { VerificationRequest } from '../../domain/entities/verification-request.entity';
import { VerificationResponseDto } from '../../presentation/dtos/verification-response.dto';

@Injectable()
export class VerificationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      // Request DTO -> Entity (user creating a verification)
      createMap(
        mapper,
        RequestVerificationDto,
        VerificationRequest,
        forMember((d) => d.reason, mapFrom((s) => s.reason)),
        forMember((d) => d.national_id_image, mapFrom((s) => s.nationalIdImage)),
      );

      // Entity -> Response DTO
      createMap(
        mapper,
        VerificationRequest,
        VerificationResponseDto,
        forMember((d) => d.verificationRequestId, mapFrom((s) => s.verification_request_id)),
        forMember((d) => d.personalAccountId, mapFrom((s) => s.personal_account && (s.personal_account as any).personal_account_id)),
        forMember((d) => d.status, mapFrom((s) => s.status)),
        forMember((d) => d.reason, mapFrom((s) => s.reason)),
        forMember((d) => d.nationalIdImage, mapFrom((s) => s.national_id_image)),
        forMember((d) => d.rejectionReason, mapFrom((s) => s.rejection_reason)),
        forMember((d) => d.submittedAt, mapFrom((s) => s.submitted_at)),
        forMember((d) => d.reviewedAt, mapFrom((s) => s.reviewed_at)),
        // reviewedBy should become ReviewedByDto or null
        forMember((d) => d.reviewedBy, mapFrom((s) => {
          if (!s.reviewed_by) return null;
          return {
            adminId: (s.reviewed_by as any).admin_user_account_id,
            firstName: (s.reviewed_by as any).first_name,
            lastName: (s.reviewed_by as any).last_name,
          };
        })),
      );
    };
  }
}
