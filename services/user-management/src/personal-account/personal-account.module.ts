import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalAccountProfile } from 'src/application/mappers/personal-account.profile';
import { CreatePersonalAccountCommandHandler } from 'src/application/personal-account/handlers/create-personal-account.handler';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { User } from 'src/domain/entities/user.entity';
import { PERSONAL_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/personal-account.repository.token';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { PersonalAccountRepositoryImpl } from 'src/infrastructure/persistence/repositories/personal-account.repository.impl';
import { UserRepositoryImpl } from 'src/infrastructure/persistence/repositories/user.repository.impl';
import { PersonalAccountController } from 'src/presentation/controllers/personal-account.controller';
import { PersonalAccountService } from '../application/services/personal-account.service';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([PersonalAccount, User]),
    CqrsModule,
  ],
  controllers: [PersonalAccountController],
  providers: [
    PersonalAccountService,
    CreatePersonalAccountCommandHandler,
    PersonalAccountProfile,
    {
      provide: PERSONAL_ACCOUNT_REPOSITORY_TOKEN,
      useClass: PersonalAccountRepositoryImpl,
    },
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepositoryImpl,
    },
  ],
})
export class PersonalAccountModule {}
