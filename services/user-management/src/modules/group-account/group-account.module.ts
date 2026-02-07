import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupAccount } from 'src/domain/entities/group-account.entity';
import { GroupAccountController } from 'src/presentation/controllers/group-account.controller';
import { GroupAccountService } from 'src/application/services/group-account.service';
import { GroupAccountRepositoryImpl } from 'src/infrastructure/persistence/repositories/group-account.repository.impl';
import { GROUP_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/group-account.repository.token';
import { RemoveGroupAccountCommandHandler } from 'src/application/handlers/group-account/remove-group-account-command.handler';
import { GetGroupAccountsQueryHandler } from 'src/application/handlers/group-account/get-group-accounts-query.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { UserRepositoryImpl } from 'src/infrastructure/persistence/repositories/user.repository.impl';
import { User } from 'src/domain/entities/user.entity';
import { FOLLOWER_REPOSITORY_TOKEN } from 'src/domain/repositories/follower.repository.token';
import { FollowerRepositoryImpl } from 'src/infrastructure/persistence/repositories/follower.repository.impl';
import { ORGANIZATIONAL_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/organizational-account.repository.token';
import { OrganizationalAccountRepositoryImpl } from 'src/infrastructure/persistence/repositories/organizational-account.repository.impl';
import { PERSONAL_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/personal-account.repository.token';
import { PersonalAccountRepositoryImpl } from 'src/infrastructure/persistence/repositories/personal-account.repository.impl';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { Follower } from 'src/domain/entities/follower.entity';
import { ElasticsearchConfig } from 'src/infrastructure/elasticsearch/elasticsearch.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GroupAccount,
      User,
      PersonalAccount,
      OrganizationalAccount,
      Follower,
    ]),
    CqrsModule,
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
  ],
  controllers: [GroupAccountController],
  providers: [
    GroupAccountService,
    ElasticsearchConfig,
    {
      provide: GROUP_ACCOUNT_REPOSITORY_TOKEN,
      useClass: GroupAccountRepositoryImpl,
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
      provide: FOLLOWER_REPOSITORY_TOKEN,
      useClass: FollowerRepositoryImpl,
    },
    RemoveGroupAccountCommandHandler,
    GetGroupAccountsQueryHandler,
  ],
})
export class GroupAccountModule {}
