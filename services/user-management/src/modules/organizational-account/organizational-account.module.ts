import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateOrganizationalAccountCommandHandler } from 'src/application/handlers/organizational-account/create-organizational-account.command-handler';
import { FindAllOrganizationalAccountsQueryHandler } from 'src/application/handlers/organizational-account/find-all-organizational-accounts.query-handler';
import { FindOrganizationalAccountByIdQueryHandler } from 'src/application/handlers/organizational-account/find-organizational-account-by-id.query-handler';
import { RemoveOrganizationalAccountCommandHandler } from 'src/application/handlers/organizational-account/remove-organizational-account.command-handler';
import { OrganizationalAccountProfile } from 'src/application/mappers/organizational-account.profile';
import { Email } from 'src/domain/entities/email.entity';
import { KYC } from 'src/domain/entities/kyc.entity';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { Owner } from 'src/domain/entities/owner.entity';
import { SocialMedia } from 'src/domain/entities/social-media.entity';
import { User } from 'src/domain/entities/user.entity';
import { EMAIL_REPOSITORY_TOKEN } from 'src/domain/repositories/email.repository.token';
import { KYC_REPOSITORY_TOKEN } from 'src/domain/repositories/kyc.repository.token';
import { ORGANIZATIONAL_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/organizational-account.repository.token';
import { OWNER_REPOSITORY_TOKEN } from 'src/domain/repositories/owner.repository.token';
import { SOCIAL_MEDIA_REPOSITORY_TOKEN } from 'src/domain/repositories/social-media.repository.token';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { EmailRepositoryImpl } from 'src/infrastructure/persistence/repositories/email.repository.impl';
import { KYCRepositoryImpl } from 'src/infrastructure/persistence/repositories/kyc.repository.impl';
import { OrganizationalAccountRepositoryImpl } from 'src/infrastructure/persistence/repositories/organizational-account.repository.impl';
import { OwnerRepositoryImpl } from 'src/infrastructure/persistence/repositories/owner.repository.impl';
import { SocialMediaRepositoryImpl } from 'src/infrastructure/persistence/repositories/social-media.repository.impl';
import { UserRepositoryImpl } from 'src/infrastructure/persistence/repositories/user.repository.impl';
import { OrganizationalAccountService } from '../../application/services/organizational-account.service';
import { OrganizationalAccountController } from '../../presentation/controllers/organizational-account.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    AutomapperModule,
    CqrsModule,
    EmailModule,
    TypeOrmModule.forFeature([
      OrganizationalAccount,
      SocialMedia,
      Owner,
      KYC,
      User,
      Email,
    ]),
  ],
  controllers: [OrganizationalAccountController],
  providers: [
    OrganizationalAccountService,
    CreateOrganizationalAccountCommandHandler,
    FindAllOrganizationalAccountsQueryHandler,
    FindOrganizationalAccountByIdQueryHandler,
    RemoveOrganizationalAccountCommandHandler,
    OrganizationalAccountProfile,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepositoryImpl,
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
      provide: EMAIL_REPOSITORY_TOKEN,
      useClass: EmailRepositoryImpl,
    },
  ],
})
export class OrganizationalAccountModule {}
