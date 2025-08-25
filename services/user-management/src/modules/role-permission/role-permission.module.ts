import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from '@nestjs/microservices'; // <-- 1. IMPORT ClientsModule
import { kafkaProducerConfig } from 'src/infrastructure/kafka/kafka.producer.config'; // <-- 2. IMPORT Kafka Config

import { AdminUserRole } from 'src/domain/entities/admin-user-role.entity';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { CreatePermissionCommandHandler } from 'src/application/handlers/role-permission/create-permission.command-handler';
import { CreateRoleCommandHandler } from 'src/application/handlers/role-permission/create-role.command-handler';
import { GetAllPermissionQueryHandler } from 'src/application/handlers/role-permission/get-all-permissions.query-handler';
import { GetAllRolesQueryHandler } from 'src/application/handlers/role-permission/get-all-roles.query-handler';
import { AdminService } from 'src/application/services/admin.service';
import { Permission } from 'src/domain/entities/permission.entity';
import { RolePermission } from 'src/domain/entities/role-permission.entity';
import { Role } from 'src/domain/entities/role.entity';
import { ROLE_REPOSITORY_TOKEN } from 'src/domain/repositories/role.repository.token';
import { RoleRepositoryImpl } from 'src/infrastructure/persistence/repositories/role.repository.impl';
import { AdminController } from 'src/presentation/controllers/admin.controller';
import { GetPermissionByIdQueryHandler } from '../../application/handlers/role-permission/get-permission-by-id.query-handler';
import { GetRoleByIdQueryHandler } from '../../application/handlers/role-permission/get-role-by-id.query-handler';
import { AuditLogInterceptor } from 'src/presentation/interceptors/audit-log.interceptor';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AssignPermissionToSuperAdminHandler } from 'src/application/handlers/role-permission/assign-permission-to-super-admin.handler';
import { RoleProfile } from 'src/application/mapping/role.profile';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role, 
      Permission, 
      RolePermission,
      AdminUser,
      AdminUserRole
    ]),
    CqrsModule,
    AuditLogModule,

    // --- 3. THIS IS THE FIX ---
    // This makes the 'KAFKA_PRODUCER' provider available to any provider in this module,
    // which is needed by the AuditLogInterceptor.
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER',
        transport: kafkaProducerConfig.transport,
        options: kafkaProducerConfig.options,
      },
    ]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    CreateRoleCommandHandler,
    CreatePermissionCommandHandler,
    GetAllRolesQueryHandler,
    GetAllPermissionQueryHandler,
    GetPermissionByIdQueryHandler,
    GetRoleByIdQueryHandler,
    AuditLogInterceptor,
    AssignPermissionToSuperAdminHandler,
    RoleProfile,
    {
      provide: ROLE_REPOSITORY_TOKEN,
      useClass: RoleRepositoryImpl,
    },
  ],
})
export class RolePermissionModule {}