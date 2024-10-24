// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatePermissionCommandHandler } from 'src/application/handlers/admin/create-permission.command-handler';
import { CreateRoleCommandHandler } from 'src/application/handlers/admin/create-role.command-handler';
import { GetAllPermissionQueryHandler } from 'src/application/handlers/admin/get-all-permissions.query-handler';
import { GetAllRolesQueryHandler } from 'src/application/handlers/admin/get-all-roles.query-handler';
import { PersonalAccountProfile } from 'src/application/mappers/personal-account.profile';
import { AdminService } from 'src/application/services/admin.service';
import { Permission } from 'src/domain/entities/permission.entity';
import { RolePermission } from 'src/domain/entities/role-permission.entity';
import { Role } from 'src/domain/entities/role.entity';
import { AdminController } from 'src/presentation/controllers/admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission, RolePermission]),
    CqrsModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    PersonalAccountProfile,
    CreateRoleCommandHandler,
    CreatePermissionCommandHandler,
    GetAllRolesQueryHandler,
    GetAllPermissionQueryHandler,
  ],
})
export class AdminModule {}
