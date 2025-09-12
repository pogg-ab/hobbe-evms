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
import { AdminUserRepositoryImpl} from '../../infrastructure/persistence/repositories/admin-user.repository.impl';

import { RequestVerificationHandler } from '../../application/handlers/verification/request-verification.handler';
import { CancelVerificationHandler } from '../../application/handlers/verification/cancel-verification.handler';
import { ReviewVerificationHandler } from '../../application/handlers/verification/review-verification.handler';
import { UnverifyAccountHandler } from '../../application/handlers/verification/unverify-account.handler';
import { ListPendingVerificationsHandler } from '../../application/handlers/verification/list-pending-verifications.handler';

import { AdminAuthGuard } from '../../presentation/guards/admin-auth.guard';
import { RolesGuard } from '../../presentation/guards/roles.guard';

const handlers = [
  RequestVerificationHandler,
  CancelVerificationHandler,
  ReviewVerificationHandler,
  UnverifyAccountHandler,
  ListPendingVerificationsHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([VerificationRequest, PersonalAccount, User, AdminUserAccount, AdminUser]),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
  ],
  controllers: [VerificationController],
  providers: [
    VerificationService,
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
    }
  ],
  exports: [VerificationService],
})
export class VerificationModule {}
