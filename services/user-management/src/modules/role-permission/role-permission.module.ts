import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatePermissionCommandHandler } from 'src/application/handlers/role-permission/create-permission.command-handler';
import { CreateRoleCommandHandler } from 'src/application/handlers/role-permission/create-role.command-handler';
import { GetAllPermissionQueryHandler } from 'src/application/handlers/role-permission/get-all-permissions.query-handler';
import { GetAllRolesQueryHandler } from 'src/application/handlers/role-permission/get-all-roles.query-handler';
import { AdminRoleProfile } from 'src/application/mappers/admin-role-profile';
import { AdminService } from 'src/application/services/admin.service';
import { Permission } from 'src/domain/entities/permission.entity';
import { RolePermission } from 'src/domain/entities/role-permission.entity';
import { Role } from 'src/domain/entities/role.entity';
import { ROLE_REPOSITORY_TOKEN } from 'src/domain/repositories/role.repository.token';
import { RoleRepositoryImpl } from 'src/infrastructure/persistence/repositories/role.repository.impl';
import { AdminController } from 'src/presentation/controllers/admin.controller';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([Role, Permission, RolePermission]),
    CqrsModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminRoleProfile,
    CreateRoleCommandHandler,
    CreatePermissionCommandHandler,
    GetAllRolesQueryHandler,
    GetAllPermissionQueryHandler,
    {
      provide: ROLE_REPOSITORY_TOKEN,
      useClass: RoleRepositoryImpl,
    },
  ],
})
export class RolePermissionModule {}
