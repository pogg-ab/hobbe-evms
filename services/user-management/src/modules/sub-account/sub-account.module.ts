import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateSubAccountCommandHandler } from 'src/application/handlers/sub-account/create-sub-account.handler';
import { FindAllSubAccountsQueryHandler } from 'src/application/handlers/sub-account/find-all-sub-accounts.handler';
import { FindSubAccountByIdQueryHandler } from 'src/application/handlers/sub-account/find-sub-account-by-id.handler';
import { RemoveSubAccountCommandHandler } from 'src/application/handlers/sub-account/remove-sub-account.handler';
import { UpdateSubAccountCommandHandler } from 'src/application/handlers/sub-account/update-sub-account.handler';
import { SubAccountService } from 'src/application/services/sub-account.service';
import { Email } from 'src/domain/entities/email.entity';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { Role } from 'src/domain/entities/role.entity';
import { SubAccount } from 'src/domain/entities/sub-account.entity';
import { UserRole } from 'src/domain/entities/user-role.entity';
import { SUB_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/sub-account.repository.token';
import { SubAccountRepositoryImpl } from 'src/infrastructure/persistence/repositories/sub-account.repository.impl';
import { SubAccountController } from 'src/presentation/controllers/sub-account.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    AutomapperModule,
    EmailModule,
    TypeOrmModule.forFeature([
      SubAccount,
      PersonalAccount,
      Email,
      Role,
      UserRole,
      OrganizationalAccount,
    ]),
    CqrsModule,
  ],
  controllers: [SubAccountController],
  providers: [
    SubAccountService,
    CreateSubAccountCommandHandler,
    UpdateSubAccountCommandHandler,
    RemoveSubAccountCommandHandler,
    FindAllSubAccountsQueryHandler,
    FindSubAccountByIdQueryHandler,
    {
      provide: SUB_ACCOUNT_REPOSITORY_TOKEN,
      useClass: SubAccountRepositoryImpl,
    },
  ],
})
export class SubAccountModule {}
