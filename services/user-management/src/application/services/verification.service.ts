// src/application/services/verification.service.ts
import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { RequestVerificationDto } from '../../presentation/dtos/request-verification.dto';
import {
  VerificationRequest,
  VerificationStatus,
} from '../../domain/entities/verification-request.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { PersonalAccount } from '../../domain/entities/personal-account.entity';
import { AdminUser } from '../../domain/entities/admin-user.entity';
import { IVerificationRequestRepository } from '../../domain/repositories/i-verification-request.repositoty';
import { IVerificationRequestRepositoryToken } from '../../domain/repositories/i-verification-request.repository.token';
import { ADMIN_USER_REPOSITORY_TOKEN } from 'src/domain/repositories/admin-user.repository.token';
import { IAdminUserRepository } from 'src/domain/repositories/admin-user.repository';
import { VerificationResponseDto } from '../../presentation/dtos/verification-response.dto';
import { AdminUserID } from 'src/domain/value-objects/admin-user-id.value-object';
import { UserService } from './user.service';
import { AccountType } from 'src/domain/value-objects/account-type.value-object';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    @Inject(IVerificationRequestRepositoryToken)
    private readonly verificationRepo: IVerificationRequestRepository,

    private readonly userService: UserService,

    @InjectMapper()
    private readonly mapper: Mapper,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    // @InjectRepository(AdminUser)
    // private readonly adminRepo: Repository<AdminUser>,

    @Inject(ADMIN_USER_REPOSITORY_TOKEN)
    private readonly adminRepo: IAdminUserRepository,

    private readonly dataSource: DataSource,
  ) {}

  private async resolvePersonalAccountForUser(
    userId: string,
  ): Promise<PersonalAccount> {
    const user = await this.userRepo.findOne({
      where: { user_id: userId },
      relations: ['personal_account'],
    });

    if (!user) throw new NotFoundException('User not found');

    const pa = (user as any).personal_account as PersonalAccount | undefined;
    if (!pa || !pa.personal_account_id) {
      throw new BadRequestException(
        'User does not have a linked personal account',
      );
    }
    return pa;
  }

  async cancelVerification(
    currentUserId: string,
  ): Promise<VerificationResponseDto> {
    const personalAccount =
      await this.resolvePersonalAccountForUser(currentUserId);
    const pending = await this.verificationRepo.findPendingByPersonalAccountId(
      personalAccount.personal_account_id.toString(),
    );
    if (!pending) {
      throw new NotFoundException(
        'No pending verification request found for this account',
      );
    }
    const toReturn = { ...pending } as VerificationRequest;
    try {
      await this.verificationRepo.remove(pending.verification_request_id);
    } catch (err) {
      try {
        await this.dataSource.transaction(async (manager) => {
          await manager.delete(VerificationRequest, {
            verification_request_id: pending.verification_request_id,
          });
        });
      } catch (err2) {
        throw new BadRequestException(
          'Failed to delete verification request: ' +
            (err2?.message ?? err?.message ?? err),
        );
      }
    }

    return this.mapper.map(
      toReturn,
      VerificationRequest,
      VerificationResponseDto,
    );
  }

  async requestVerification(
    currentUserId: string,
    dto: RequestVerificationDto,
  ): Promise<VerificationResponseDto> {
    const personalAccount =
      await this.resolvePersonalAccountForUser(currentUserId);

    const lastRequest = await this.verificationRepo.findLastByPersonalAccountId(
      personalAccount.personal_account_id.toString(),
    );

    if (lastRequest) {
      switch (lastRequest.status) {
        case VerificationStatus.PENDING:
          throw new BadRequestException(
            'You already have a pending verification request',
          );
        case VerificationStatus.APPROVED:
          throw new BadRequestException('Your account is already verified');
        case VerificationStatus.REJECTED:
        case VerificationStatus.CANCELED:
          break;
      }
    }

    const entity = this.mapper.map(
      dto,
      RequestVerificationDto,
      VerificationRequest,
    );
    entity.personal_account = personalAccount;
    entity.status = VerificationStatus.PENDING;

    const saved = await this.verificationRepo.create(entity);
    const populated = await this.verificationRepo.findById(
      saved.verification_request_id,
    );

    return this.mapper.map(
      populated,
      VerificationRequest,
      VerificationResponseDto,
    );
  }

  async findPendingVerifications(): Promise<VerificationResponseDto[]> {
    try {
      const list = await this.verificationRepo.findPendingRequests();
      if (!list || (Array.isArray(list) && list.length === 0)) {
        this.logger.verbose('No pending verifications found');
        return [];
      }
      return list.map((item) =>
        this.mapper.map(item, VerificationRequest, VerificationResponseDto),
      );
    } catch (err) {
      this.logger.error(
        'findPendingVerifications repo failed',
        err?.stack ?? err,
      );
      return [];
    }
  }

  async getStatusByUserId(userId: string): Promise<VerificationRequest> {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    console.log('user account type', user.account_type);

    let verification: VerificationRequest | null = null;

    if (user.account_type === AccountType.PERSONAL) {
      const personalAccountId = user.account_info.personal_account_id;
      verification =
        await this.verificationRepo.findLastByPersonalAccountId(
          personalAccountId,
        );
    } else if (user.account_type === AccountType.ORGANIZATIONAL) {
      const orgAccountId = user.account_info.organizational_account_id;
      verification =
        await this.verificationRepo.findLastByOrganizationalAccountId(
          orgAccountId,
        );
    } else {
      throw new NotFoundException('User account information not found');
    }

    if (!verification) {
      throw new NotFoundException('No verification record found');
    }

    return verification;
  }

  async reviewVerificationRequest(
    adminId: string,
    verificationRequestId: string,
    decision: { decision: VerificationStatus; rejectionReason?: string | null },
  ): Promise<VerificationResponseDto> {
    console.log('admin id:', adminId);
    return await this.dataSource.transaction(async (manager) => {
      const vr = await manager.findOne(VerificationRequest, {
        where: { verification_request_id: verificationRequestId },
        relations: ['personal_account'],
      });
      if (!vr) throw new NotFoundException('Verification request not found');
      if (vr.status !== VerificationStatus.PENDING)
        throw new BadRequestException(
          'Only pending verification requests can be reviewed',
        );

      const admin = await this.adminRepo.findOneById(new AdminUserID(adminId));

      if (!admin) {
        throw new NotFoundException(`Admin user not found for id: ${adminId}`);
      }

      vr.status = decision.decision;
      vr.reviewed_at = new Date();
      vr.reviewed_by = admin;

      if (decision.decision === VerificationStatus.REJECTED) {
        vr.rejection_reason = decision.rejectionReason ?? null;
        await manager.save(vr);
        const populated = await manager.findOne(VerificationRequest, {
          where: { verification_request_id: vr.verification_request_id },
          relations: ['personal_account', 'reviewed_by'],
        });
        return this.mapper.map(
          populated,
          VerificationRequest,
          VerificationResponseDto,
        );
      }

      if (decision.decision === VerificationStatus.APPROVED) {
        const pa = vr.personal_account;
        pa.is_verified = true;
        pa.verification_date = new Date();

        await manager.save(pa);
        await manager.save(vr);
        const populated = await manager.findOne(VerificationRequest, {
          where: { verification_request_id: vr.verification_request_id },
          relations: ['personal_account', 'reviewed_by'],
        });
        return this.mapper.map(
          populated,
          VerificationRequest,
          VerificationResponseDto,
        );
      }

      const populated = await manager.findOne(VerificationRequest, {
        where: { verification_request_id: vr.verification_request_id },
        relations: ['personal_account', 'reviewed_by'],
      });
      return this.mapper.map(
        populated,
        VerificationRequest,
        VerificationResponseDto,
      );
    });
  }

  async unverifyAccount(
    adminId: string,
    personalAccountId: string,
  ): Promise<PersonalAccount> {
    return await this.dataSource.transaction(async (manager) => {
      const pa = await manager.findOne(PersonalAccount, {
        where: { personal_account_id: personalAccountId },
        relations: ['verification_request'],
      });
      if (!pa) throw new NotFoundException('Personal account not found');

      const admin = await manager.findOne(AdminUser, {
        where: { admin_user_id: adminId },
      });
      if (!admin) throw new NotFoundException('Admin user not found');

      pa.is_verified = false;
      pa.verification_date = null;
      await manager.save(pa);

      const vr = pa.verification_request;

      if (vr) {
        vr.status = VerificationStatus.REJECTED;
        vr.rejection_reason = 'Revoked by admin';
        vr.reviewed_at = new Date();
        vr.reviewed_by = admin;
        await manager.save(vr);
      }

      return pa;
    });
  }

  async findById(
    verificationRequestId: string,
  ): Promise<VerificationResponseDto | null> {
    const vr = await this.verificationRepo.findById(verificationRequestId);
    if (!vr) return null;
    return this.mapper.map(vr, VerificationRequest, VerificationResponseDto);
  }
}
