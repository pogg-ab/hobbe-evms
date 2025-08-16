import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateOrganizationalAccountCommandHandler } from 'src/application/handlers/organizational-account/create-organizational-account.command-handler';
import { FindAllOrganizationalAccountsQueryHandler } from 'src/application/handlers/organizational-account/find-all-organizational-accounts.query-handler';
import { FindOrganizationalAccountByIdQueryHandler } from 'src/application/handlers/organizational-account/find-organizational-account-by-id.query-handler';
import { RemoveOrganizationalAccountCommandHandler } from 'src/application/handlers/organizational-account/remove-organizational-account.command-handler';
import { OrganizationalAccountProfile } from 'src/application/mappers/organizational-account.profile';
import { KYC } from 'src/domain/entities/kyc.entity';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { Owner } from 'src/domain/entities/owner.entity';
import { SocialMedia } from 'src/domain/entities/social-media.entity';
import { User } from 'src/domain/entities/user.entity';
import { KYC_REPOSITORY_TOKEN } from 'src/domain/repositories/kyc.repository.token';
import { ORGANIZATIONAL_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/organizational-account.repository.token';
import { OWNER_REPOSITORY_TOKEN } from 'src/domain/repositories/owner.repository.token';
import { SOCIAL_MEDIA_REPOSITORY_TOKEN } from 'src/domain/repositories/social-media.repository.token';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { kafkaProducerConfig } from 'src/infrastructure/kafka/kafka.producer.config';
import { MessageProducerService } from 'src/infrastructure/kafka/message.producer.service';
import { NotificationConfigService } from 'src/infrastructure/notification-config.service';
import { KYCRepositoryImpl } from 'src/infrastructure/persistence/repositories/kyc.repository.impl';
import { OrganizationalAccountRepositoryImpl } from 'src/infrastructure/persistence/repositories/organizational-account.repository.impl';
import { OwnerRepositoryImpl } from 'src/infrastructure/persistence/repositories/owner.repository.impl';
import { SocialMediaRepositoryImpl } from 'src/infrastructure/persistence/repositories/social-media.repository.impl';
import { UserRepositoryImpl } from 'src/infrastructure/persistence/repositories/user.repository.impl';
import { OrganizationalAccountService } from '../../application/services/organizational-account.service';
import { OrganizationalAccountController } from '../../presentation/controllers/organizational-account.controller';
import { Follower } from 'src/domain/entities/follower.entity';
import { FOLLOWER_REPOSITORY_TOKEN } from 'src/domain/repositories/follower.repository.token';
import { FollowerRepositoryImpl } from 'src/infrastructure/persistence/repositories/follower.repository.impl';
import { ElasticsearchConfig } from 'src/infrastructure/elasticsearch/elasticsearch.config';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';

@Module({
  imports: [
    AutomapperModule,
    CqrsModule,
    TypeOrmModule.forFeature([
      OrganizationalAccount,
      SocialMedia,
      Owner,
      KYC,
      User,
      Follower,
      PersonalAccount,
    ]),
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER',
        transport: kafkaProducerConfig.transport,
        options: kafkaProducerConfig.options,
      },
    ]),
  ],
  controllers: [OrganizationalAccountController],
  providers: [
    OrganizationalAccountService,
    ElasticsearchConfig,
    CreateOrganizationalAccountCommandHandler,
    FindAllOrganizationalAccountsQueryHandler,
    FindOrganizationalAccountByIdQueryHandler,
    RemoveOrganizationalAccountCommandHandler,
    OrganizationalAccountProfile,
    MessageProducerService,
    NotificationConfigService,
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
      provide: FOLLOWER_REPOSITORY_TOKEN,
      useClass: FollowerRepositoryImpl,
    },
  ],
})
export class OrganizationalAccountModule {}
