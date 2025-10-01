import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePermissionCommand } from 'src/application/commands/role-permission/create-permission.command';
import { CreateRoleCommand } from 'src/application/commands/role-permission/create-role.command';
import { GetAllPermissionQuery } from 'src/application/queries/role-permission/get-all-permissions.query';
import { GetAllRolesQuery } from 'src/application/queries/role-permission/get-all-roles.query';
import { GetPermissionByIdQuery } from 'src/application/queries/role-permission/get-permission-by-id.query';
import { GetRoleByIdQuery } from 'src/application/queries/role-permission/get-role-by-id.query';
import { AdminService } from 'src/application/services/admin.service';
import { Permission } from 'src/domain/entities/permission.entity';
import { Role } from 'src/domain/entities/role.entity';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { GetRoleDto } from '../dtos/get-role.dto';
import { UpdatePermissionDto } from '../dtos/update-permission.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { AuditLogInterceptor } from '../interceptors/audit-log.interceptor';
import { AdminAuthGuard } from '../guards/admin-auth.guard'; // Assuming this is the correct name
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { MessagePattern, Payload } from '@nestjs/microservices';

@ApiTags('Role and Permission')
@Controller('role-permission')
@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, PermissionsGuard)
export class AdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly adminService: AdminService,
    private readonly queryBus: QueryBus,
  ) {}

  // --- ROLE ENDPOINTS ---
  @Post('roles')
  @Permissions('create:role:RBAC')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  async addRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.commandBus.execute(new CreateRoleCommand(createRoleDto));
  }

  @Get('roles')
  @Permissions('view:roles:RBAC')
  @ApiOperation({ summary: 'Retrieve all roles' })
  async viewRoles(): Promise<GetRoleDto[]> {
    return this.queryBus.execute(new GetAllRolesQuery());
  }

  @Put('roles/:id')
  @Permissions('update:role:RBAC')
  @ApiOperation({ summary: 'Update an existing role' })
  @ApiBody({ type: UpdateRoleDto })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return this.adminService.updateRole(id, updateRoleDto);
  }

  @Get('roles/:id')
  @Permissions('view:roles:RBAC')
  @ApiOperation({ summary: 'Retrieve a single role by ID' })
  async findRoleById(@Param('id') id: string): Promise<Role> {
    return this.queryBus.execute(new GetRoleByIdQuery(id));
  }

  @Delete('roles/:id')
  @Permissions('delete:role:RBAC')
  @ApiOperation({ summary: 'Delete a role by ID' })
  async deleteRole(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteRole(id);
  }

  // --- PERMISSION ENDPOINTS ---
  @Post('permissions')
  @Permissions('create:permission:RBAC')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiBody({ type: CreatePermissionDto })
  async addPermission(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    return this.commandBus.execute(
      new CreatePermissionCommand(createPermissionDto),
    );
  }

  @Get('permissions')
  @Permissions('view:permissions:RBAC')
  @ApiOperation({ summary: 'Retrieve all permissions' })
  async viewPermissions(): Promise<Permission[]> {
    return this.queryBus.execute(new GetAllPermissionQuery());
  }

  @Get('permissions/:id')
  @Permissions('view:permissions:RBAC')
  @ApiOperation({ summary: 'Retrieve a single permission by ID' })
  async findPermissionById(@Param('id') id: string): Promise<Permission> {
    return this.queryBus.execute(new GetPermissionByIdQuery(id));
  }

  @Put('permissions/:id')
  @Permissions('update:permission:RBAC')
  @ApiOperation({ summary: 'Update an existing permission' })
  @ApiBody({ type: UpdatePermissionDto })
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.adminService.updatePermission(id, updatePermissionDto);
  }

  @Delete('permissions/:id')
  @Permissions('delete:permission:RBAC')
  @ApiOperation({ summary: 'Delete a permission by ID' })
  async deletePermission(@Param('id') id: string): Promise<void> {
    return this.adminService.deletePermission(id);
  }

  @MessagePattern('checkRolePermissions')
  async validateJWT(@Payload() payload: any): Promise<any> {
    return await this.adminService.checkRolePermissions(payload);
  }
}
