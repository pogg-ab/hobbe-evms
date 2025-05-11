import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateAdminUserAccountCommandHandler } from 'src/application/handlers/admin-user-account/create-admin-user-account.command-handler';
import { FindAdminUserAccountByIdQueryHandler } from 'src/application/handlers/admin-user-account/find-admin-user-account-by-id.query-handler';
import { FindAllAdminUserAccountsQueryHandler } from 'src/application/handlers/admin-user-account/find-all-admin-user-accounts.query-handler';
import { RemoveAdminUserAccountCommandHandler } from 'src/application/handlers/admin-user-account/remove-admin-user-account.command-handler';
import { UpdateAdminUserAccountCommandHandler } from 'src/application/handlers/admin-user-account/update-admin-user-account.command-handler';
import { AdminUserAccountProfile } from 'src/application/mappers/admin-user-account.profile';
import { RoleProfile } from 'src/application/mappers/role.profile';
import { AdminUserAccount } from 'src/domain/entities/admin-user-account.entity';
import { AdminUserRole } from 'src/domain/entities/admin-user-role.entity';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { Role } from 'src/domain/entities/role.entity';
import { ADMIN_USER_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/admin-user-account.repository.token';
import { ADMIN_USER_ROLE_REPOSITORY_TOKEN } from 'src/domain/repositories/admin-user-role.repository.token';
import { ADMIN_USER_REPOSITORY_TOKEN } from 'src/domain/repositories/admin-user.repository.token';
import { ROLE_REPOSITORY_TOKEN } from 'src/domain/repositories/role.repository.token';
import { kafkaProducerConfig } from 'src/infrastructure/kafka/kafka.producer.config';
import { MessageProducerService } from 'src/infrastructure/kafka/message.producer.service';
import { AdminUserAccountRepositoryImpl } from 'src/infrastructure/persistence/repositories/admin-user-account.repository.impl';
import { AdminUserRoleRepositoryImpl } from 'src/infrastructure/persistence/repositories/admin-user-role.repository.impl';
import { AdminUserRepositoryImpl } from 'src/infrastructure/persistence/repositories/admin-user.repository.impl';
import { RoleRepositoryImpl } from 'src/infrastructure/persistence/repositories/role.repository.impl';
import { AdminUserAccountController } from 'src/presentation/controllers/admin-user-account.controller';
import { AdminUserAccountService } from '../../application/services/admin-user-account.service';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([
      AdminUserAccount,
      AdminUser,
      Role,
      AdminUserRole,
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
  controllers: [AdminUserAccountController],
  providers: [
    AdminUserAccountService,
    AdminUserAccountProfile,
    CreateAdminUserAccountCommandHandler,
    FindAllAdminUserAccountsQueryHandler,
    FindAdminUserAccountByIdQueryHandler,
    UpdateAdminUserAccountCommandHandler,
    RemoveAdminUserAccountCommandHandler,
    RoleProfile,
    MessageProducerService,
    {
      provide: ADMIN_USER_ACCOUNT_REPOSITORY_TOKEN,
      useClass: AdminUserAccountRepositoryImpl,
    },
    {
      provide: ADMIN_USER_REPOSITORY_TOKEN,
      useClass: AdminUserRepositoryImpl,
    },
    {
      provide: ADMIN_USER_ROLE_REPOSITORY_TOKEN,
      useClass: AdminUserRoleRepositoryImpl,
    },
    {
      provide: ROLE_REPOSITORY_TOKEN,
      useClass: RoleRepositoryImpl,
    },
  ],
})
export class AdminUserAccountModule {}
