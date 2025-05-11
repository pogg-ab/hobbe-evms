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
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePermissionCommand } from 'src/application/commands/role-permission/create-permission.command';
import { CreateRoleCommand } from 'src/application/commands/role-permission/create-role.command';
import { GetAllPermissionQuery } from 'src/application/queries/role-permission/get-all-permissions.query';
import { GetAllRolesQuery } from 'src/application/queries/role-permission/get-all-roles.query';
import { AdminService } from 'src/application/services/admin.service';
import { Permission } from 'src/domain/entities/permission.entity';
import { Role } from 'src/domain/entities/role.entity';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { GetRoleDto } from '../dtos/get-role.dto';
import { UpdatePermissionDto } from '../dtos/update-permission.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';

@ApiTags('Role and Permission')
@Controller('role-permission')
export class AdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly adminService: AdminService,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('roles')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  async addRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    const command = new CreateRoleCommand(createRoleDto);
    return this.commandBus.execute(command);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Retrieve all roles' })
  async viewRoles(): Promise<GetRoleDto[]> {
    const query = new GetAllRolesQuery();
    return this.queryBus.execute(query);
  }

  @Put('roles/:id')
  @ApiOperation({ summary: 'Update an existing role' })
  @ApiBody({ type: UpdateRoleDto })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return this.adminService.updateRole(id, updateRoleDto);
  }

  @Delete('roles/:id')
  @ApiOperation({ summary: 'Delete a role by ID' })
  async deleteRole(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteRole(id);
  }

  @Post('permissions')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiBody({ type: CreatePermissionDto })
  async addPermission(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    const command = new CreatePermissionCommand(createPermissionDto);
    return this.commandBus.execute(command);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Retrieve all permissions' })
  async viewPermissions(): Promise<Permission[]> {
    const query = new GetAllPermissionQuery();
    return this.queryBus.execute(query);
  }

  @Put('permissions/:id')
  @ApiOperation({ summary: 'Update an existing permission' })
  @ApiBody({ type: UpdatePermissionDto })
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.adminService.updatePermission(id, updatePermissionDto);
  }

  @Delete('permissions/:id')
  @ApiOperation({ summary: 'Delete a permission by ID' })
  async deletePermission(@Param('id') id: string): Promise<void> {
    return this.adminService.deletePermission(id);
  }
}
