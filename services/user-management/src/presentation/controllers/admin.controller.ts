import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { CreatePermissionCommand } from 'src/application/commands/admin/create-permission.command';
import { CreateRoleCommand } from 'src/application/commands/admin/create-role.command';
import { GetAllPermissionQuery } from 'src/application/queries/admin/get-all-permissions.query';
import { GetAllRolesQuery } from 'src/application/queries/admin/get-all-roles.query';
import { AdminService } from 'src/application/services/admin.service';
import { Permission } from 'src/domain/entities/permission.entity';
import { Role } from 'src/domain/entities/role.entity';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { GetRoleDto } from '../dtos/get-role.dto';
import { UpdatePermissionDto } from '../dtos/update-permission.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly adminService: AdminService,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('roles')
  async addRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    const command = new CreateRoleCommand(createRoleDto);
    return this.commandBus.execute(command);
  }

  @Get('roles')
  async viewRoles(): Promise<GetRoleDto[]> {
    const query = new GetAllRolesQuery();
    return this.queryBus.execute(query);
  }

  @Put('roles/:id')
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return this.adminService.updateRole(id, updateRoleDto);
  }

  @Delete('roles/:id')
  async deleteRole(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteRole(id);
  }

  @Post('permissions')
  async addPermission(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    const command = new CreatePermissionCommand(createPermissionDto);
    return this.commandBus.execute(command);
  }

  @Get('permissions')
  async viewPermissions(): Promise<Permission[]> {
    const query = new GetAllPermissionQuery();
    return this.queryBus.execute(query);
  }

  @Put('permissions/:id')
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.adminService.updatePermission(id, updatePermissionDto);
  }

  @Delete('permissions/:id')
  async deletePermission(@Param('id') id: string): Promise<void> {
    return this.adminService.deletePermission(id);
  }
}
