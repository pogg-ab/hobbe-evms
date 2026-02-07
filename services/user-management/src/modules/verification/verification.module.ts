// src/presentation/modules/verification.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { Reflector } from '@nestjs/core';

import { VerificationController } from '../../presentation/controllers/verification.controller';
import { VerificationService } from '../../application/services/verification.service';
import { VerificationRequest } from '../../domain/entities/verification-request.entity';
import { PersonalAccount } from '../../domain/entities/personal-account.entity';
import { User } from '../../domain/entities/user.entity';
import { AdminUserAccount } from '../../domain/entities/admin-user-account.entity';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { VerificationRequestRepositoryImpl } from '../../infrastructure/persistence/repositories/verification-request.repository.impl';
import { VerificationProfile } from '../../application/mappers/verification.profile';
import { IVerificationRequestRepositoryToken } from '../../domain/repositories/i-verification-request.repository.token';
import { ADMIN_USER_REPOSITORY_TOKEN } from 'src/domain/repositories/admin-user.repository.token';
import { AdminUserRepositoryImpl } from '../../infrastructure/persistence/repositories/admin-user.repository.impl';

import { RequestVerificationHandler } from '../../application/handlers/verification/request-verification.handler';
import { CancelVerificationHandler } from '../../application/handlers/verification/cancel-verification.handler';
import { ReviewVerificationHandler } from '../../application/handlers/verification/review-verification.handler';
import { UnverifyAccountHandler } from '../../application/handlers/verification/unverify-account.handler';
import { ListPendingVerificationsHandler } from '../../application/handlers/verification/list-pending-verifications.handler';

import { AdminAuthGuard } from '../../presentation/guards/admin-auth.guard';
import { RolesGuard } from '../../presentation/guards/roles.guard';
import { GetVerificationStatusQueryHandler } from 'src/application/handlers/verification/get-verification-status.query.handler';
import { UserService } from 'src/application/services/user.service';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { UserRepositoryImpl } from 'src/infrastructure/persistence/repositories/user.repository.impl';
import { PERSONAL_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/personal-account.repository.token';
import { PersonalAccountRepositoryImpl } from 'src/infrastructure/persistence/repositories/personal-account.repository.impl';
import { FOLLOWER_REPOSITORY_TOKEN } from 'src/domain/repositories/follower.repository.token';
import { FollowerRepositoryImpl } from 'src/infrastructure/persistence/repositories/follower.repository.impl';
import { SocialMediaRepositoryImpl } from 'src/infrastructure/persistence/repositories/social-media.repository.impl';
import { SOCIAL_MEDIA_REPOSITORY_TOKEN } from 'src/domain/repositories/social-media.repository.token';
import { KYCRepositoryImpl } from 'src/infrastructure/persistence/repositories/kyc.repository.impl';
import { KYC_REPOSITORY_TOKEN } from 'src/domain/repositories/kyc.repository.token';
import { OwnerRepositoryImpl } from 'src/infrastructure/persistence/repositories/owner.repository.impl';
import { OWNER_REPOSITORY_TOKEN } from 'src/domain/repositories/owner.repository.token';
import { ORGANIZATIONAL_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/organizational-account.repository.token';
import { OrganizationalAccountRepositoryImpl } from 'src/infrastructure/persistence/repositories/organizational-account.repository.impl';
import { ElasticsearchConfig } from 'src/infrastructure/elasticsearch/elasticsearch.config';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { Follower } from 'src/domain/entities/follower.entity';
import { KYC } from 'src/domain/entities/kyc.entity';
import { Owner } from 'src/domain/entities/owner.entity';
import { SocialMedia } from 'src/domain/entities/social-media.entity';

const handlers = [
  RequestVerificationHandler,
  CancelVerificationHandler,
  ReviewVerificationHandler,
  UnverifyAccountHandler,
  ListPendingVerificationsHandler,
  GetVerificationStatusQueryHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      VerificationRequest,
      PersonalAccount,
      OrganizationalAccount,
      User,
      AdminUserAccount,
      AdminUser,
      SocialMedia,
      Owner,
      Follower,
      KYC,
    ]),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
  ],
  controllers: [VerificationController],
  providers: [
    VerificationService,
    ElasticsearchConfig,
    UserService,
    VerificationProfile,
    Reflector,
    ...handlers,
    AdminAuthGuard,
    RolesGuard,
    {
      provide: IVerificationRequestRepositoryToken,
      useClass: VerificationRequestRepositoryImpl,
    },
    {
      provide: ADMIN_USER_REPOSITORY_TOKEN,
      useClass: AdminUserRepositoryImpl,
    },
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepositoryImpl,
    },
    {
      provide: PERSONAL_ACCOUNT_REPOSITORY_TOKEN,
      useClass: PersonalAccountRepositoryImpl,
    },
    {
      provide: ORGANIZATIONAL_ACCOUNT_REPOSITORY_TOKEN,
      useClass: OrganizationalAccountRepositoryImpl,
    },
    {
      provide: OWNER_REPOSITORY_TOKEN,
      useClass: OwnerRepositoryImpl,
    },
    {
      provide: KYC_REPOSITORY_TOKEN,
      useClass: KYCRepositoryImpl,
    },
    {
      provide: SOCIAL_MEDIA_REPOSITORY_TOKEN,
      useClass: SocialMediaRepositoryImpl,
    },
    {
      provide: FOLLOWER_REPOSITORY_TOKEN,
      useClass: FollowerRepositoryImpl,
    },
  ],
  exports: [VerificationService],
})
export class VerificationModule {}
