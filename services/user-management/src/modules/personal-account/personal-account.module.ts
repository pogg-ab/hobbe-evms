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
import { ClientsModule } from '@nestjs/microservices';
import { FindAllPersonalAccountsQueryHandler } from 'src/application/handlers/personal-account/find-all-personal-accounts.query-handler';
import { FindPersonalAccountByIdQueryHandler } from 'src/application/handlers/personal-account/find-personal-account-by-id.query-handler';
import { RemovePersonalAccountCommandHandler } from 'src/application/handlers/personal-account/remove-personal-account.command-handler';
import { SendEmailVerificationCommandHandler } from 'src/application/handlers/personal-account/send-email-verification.command-handler';
import { SendEmailVerificationWithDBCommandHandler } from 'src/application/handlers/personal-account/send-email-verificationDb.command-handler';
import { UpdatePersonalAccountCommandHandler } from 'src/application/handlers/personal-account/update-personal-account.command-handler';
import { VerifyEmailCommandHandler } from 'src/application/handlers/personal-account/verify-email-command.handler';
import { RoleProfile } from 'src/application/mappers/role.profile';
import { UserProfile } from 'src/application/mappers/user.profile';
import { Role } from 'src/domain/entities/role.entity';
import { UserRole } from 'src/domain/entities/user-role.entity';
import { ROLE_REPOSITORY_TOKEN } from 'src/domain/repositories/role.repository.token';
import { USER_ROLE_REPOSITORY_TOKEN } from 'src/domain/repositories/user-role.repository.token';
import { kafkaProducerConfig } from 'src/infrastructure/kafka/kafka.producer.config';
import { MessageProducerService } from 'src/infrastructure/kafka/message.producer.service';
import { NotificationConfigService } from 'src/infrastructure/notification-config.service';
import { RoleRepositoryImpl } from 'src/infrastructure/persistence/repositories/role.repository.impl';
import { UserRoleRepositoryImpl } from 'src/infrastructure/persistence/repositories/user-role.repository.impl';
import { UserRepositoryImpl } from 'src/infrastructure/persistence/repositories/user.repository.impl';
import { PersonalAccountController } from 'src/presentation/controllers/personal-account.controller';
import { PersonalAccountService } from '../../application/services/personal-account.service';
import { FOLLOWER_REPOSITORY_TOKEN } from 'src/domain/repositories/follower.repository.token';
import { FollowerRepositoryImpl } from 'src/infrastructure/persistence/repositories/follower.repository.impl';
import { Follower } from 'src/domain/entities/follower.entity';
import { UpdateProfileImageCommand } from 'src/application/commands/personal-account/update-profile-image-command';
import { UpdateProfileImageCommandHandler } from 'src/application/handlers/personal-account/update-profile-image-command-handler';
import { ElasticsearchConfig } from 'src/infrastructure/elasticsearch/elasticsearch.config';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([
      PersonalAccount,
      User,
      Role,
      UserRole,
      Follower,
      OrganizationalAccount,
    ]),
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER',
        transport: kafkaProducerConfig.transport,
        options: kafkaProducerConfig.options,
      },
    ]),
    CqrsModule,
  ],
  controllers: [PersonalAccountController],
  providers: [
    PersonalAccountService,
    ElasticsearchConfig,
    CreatePersonalAccountCommandHandler,
    FindAllPersonalAccountsQueryHandler,
    FindPersonalAccountByIdQueryHandler,
    UpdatePersonalAccountCommandHandler,
    RemovePersonalAccountCommandHandler,
    SendEmailVerificationCommandHandler,
    SendEmailVerificationWithDBCommandHandler,
    VerifyEmailCommandHandler,
    UpdateProfileImageCommandHandler,
    PersonalAccountProfile,
    UserProfile,
    RoleProfile,
    MessageProducerService,
    NotificationConfigService,

    {
      provide: PERSONAL_ACCOUNT_REPOSITORY_TOKEN,
      useClass: PersonalAccountRepositoryImpl,
    },
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepositoryImpl,
    },
    {
      provide: USER_ROLE_REPOSITORY_TOKEN,
      useClass: UserRoleRepositoryImpl,
    },
    {
      provide: ROLE_REPOSITORY_TOKEN,
      useClass: RoleRepositoryImpl,
    },
    {
      provide: FOLLOWER_REPOSITORY_TOKEN,
      useClass: FollowerRepositoryImpl,
    },
  ],
})
export class PersonalAccountModule {}
