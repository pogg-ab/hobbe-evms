import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatePersonalAccountCommandHandler } from 'src/application/handlers/personal-account/create-personal-account.handler';
import { PersonalAccountProfile } from 'src/application/mappers/personal-account.profile';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { User } from 'src/domain/entities/user.entity';
import { PERSONAL_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/personal-account.repository.token';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { PersonalAccountRepositoryImpl } from 'src/infrastructure/persistence/repositories/personal-account.repository.impl';
// import { UserRoleRepositoryImpl } from 'src/infrastructure/persistence/repositories/user-role.repository.impl';
import { FindAllPersonalAccountsQueryHandler } from 'src/application/handlers/personal-account/find-all-personal-accounts.query-handler';
import { FindPersonalAccountByIdQueryHandler } from 'src/application/handlers/personal-account/find-personal-account-by-id.query-handler';
import { RemovePersonalAccountCommandHandler } from 'src/application/handlers/personal-account/remove-personal-account.command-handler';
import { SendEmailVerificationCommandHandler } from 'src/application/handlers/personal-account/send-email-verification.command-handler';
import { SendEmailVerificationDbCommandHandler } from 'src/application/handlers/personal-account/send-email-verificationDB.command-handler';
import { UpdatePersonalAccountCommandHandler } from 'src/application/handlers/personal-account/update-personal-account.command-handler';
import { VerifyEmailCommandHandler } from 'src/application/handlers/personal-account/verify-email-command.handler';
import { Email } from 'src/domain/entities/email.entity';
import { EMAIL_REPOSITORY_TOKEN } from 'src/domain/repositories/email.repository.token';
import { EmailRepositoryImpl } from 'src/infrastructure/persistence/repositories/email.repository.impl';
import { UserRepositoryImpl } from 'src/infrastructure/persistence/repositories/user.repository.impl';
import { PersonalAccountController } from 'src/presentation/controllers/personal-account.controller';
import { PersonalAccountService } from '../../application/services/personal-account.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    AutomapperModule,
    EmailModule,
    TypeOrmModule.forFeature([PersonalAccount, User, Email]),
    CqrsModule,
  ],
  controllers: [PersonalAccountController],
  providers: [
    PersonalAccountService,
    CreatePersonalAccountCommandHandler,
    FindAllPersonalAccountsQueryHandler,
    FindPersonalAccountByIdQueryHandler,
    UpdatePersonalAccountCommandHandler,
    RemovePersonalAccountCommandHandler,
    SendEmailVerificationCommandHandler,
    SendEmailVerificationDbCommandHandler,
    VerifyEmailCommandHandler,
    PersonalAccountProfile,
    {
      provide: PERSONAL_ACCOUNT_REPOSITORY_TOKEN,
      useClass: PersonalAccountRepositoryImpl,
    },
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepositoryImpl,
    },
    {
      provide: EMAIL_REPOSITORY_TOKEN,
      useClass: EmailRepositoryImpl,
    },
    // {
    //   provide: USER_ROLE_REPOSITORY_TOKEN,
    //   useClass: UserRoleRepositoryImpl,
    // },
  ],
})
export class PersonalAccountModule {}
