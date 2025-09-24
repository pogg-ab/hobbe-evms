import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssignRoleToUserCommand } from 'src/application/commands/admin-user-account/assign-role-to-user.command';
import { CreateAdminUserAccountCommand } from 'src/application/commands/admin-user-account/create-admin-user-account.command';
import { RemoveAdminUserAccountCommand } from 'src/application/commands/admin-user-account/remove-admin-user-account.command';
import { UpdateAdminUserAccountCommand } from 'src/application/commands/admin-user-account/update-admin-user-account.command';
import { FindAdminUserAccountByIdQuery } from 'src/application/queries/admin-user-account/find-admin-user-account-by-id.query';
import { FindAllAdminUserAccountsQuery } from 'src/application/queries/admin-user-account/find-all-admin-user-accounts.query';
import { AdminUserAccount } from 'src/domain/entities/admin-user-account.entity';
import { AssignRoleDto } from '../dtos/assign-role.dto';
import { CreateAdminUserAccountDto } from '../dtos/create-admin-user-account.dto';
import { UpdateAdminUserAccountDto } from '../dtos/update-admin-user-account.dto';
import { Permissions } from '../decorators/permissions.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { AuditLogInterceptor } from '../interceptors/audit-log.interceptor';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { FindAllAdminUsersQuery } from 'src/application/queries/admin-user-account/find-all-admin-users.query';

@ApiTags('Admin User Account')
@Controller('admin-user-account')
@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, PermissionsGuard)
export class AdminUserAccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Permissions('create:admin_user:AdminUsers')
  @ApiOperation({
    summary: 'Create a new admin user account (Super Admin only)',
  })
  @ApiBody({ type: CreateAdminUserAccountDto })
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'Admin user account created successfully',
    type: AdminUserAccount,
  })
  async create(
    @Body() createAdminUserAccountDto: CreateAdminUserAccountDto,
  ): Promise<{ message: string; account: AdminUserAccount }> {
    const command = new CreateAdminUserAccountCommand(
      createAdminUserAccountDto,
    );
    const createdAccount = await this.commandBus.execute(command);
    return {
      message: 'Admin user account created successfully',
      account: createdAccount,
    };
  }

  @Post(':userId/roles')
  @Permissions('assign:role:AdminUsers')
  @ApiOperation({
    summary: 'Assign a new role to an admin user (Super Admin only)',
  })
  @ApiResponse({ status: 201, description: 'Role assigned successfully.' })
  @ApiBody({ type: AssignRoleDto })
  async assignRole(
    @Param('userId') userId: string,
    @Body() assignRoleDto: AssignRoleDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new AssignRoleToUserCommand(userId, assignRoleDto),
    );
  }

  @Get()
  @Permissions('view:admin_users:AdminUsers')
  @ApiOperation({ summary: 'Get all admin user accounts' })
  @ApiResponse({
    status: 200,
    description: 'List of all admin user accounts',
    type: [AdminUserAccount],
  })
  async findAll(): Promise<AdminUserAccount[]> {
    return this.queryBus.execute(new FindAllAdminUserAccountsQuery());
  }

  @Get('admin-user')
  @Permissions('view:admin_users:AdminUsers')
  @ApiOperation({ summary: 'Get all admin users' })
  @ApiResponse({
    status: 200,
    description: 'List of admin users',
    type: [AdminUser],
  })
  async findAllAdminUsers(): Promise<AdminUserAccount[]> {
    return this.queryBus.execute(new FindAllAdminUsersQuery());
  }

  @Get(':id')
  @Permissions('view:admin_users:AdminUsers')
  @ApiOperation({ summary: 'Get a single admin user account by ID' })
  @ApiResponse({
    status: 200,
    description: 'Admin user account details',
    type: AdminUserAccount,
  })
  async findOne(@Param('id') id: string): Promise<AdminUserAccount | null> {
    return this.queryBus.execute(new FindAdminUserAccountByIdQuery(id));
  }

  @Put(':id')
  @Permissions('update:admin_user:AdminUsers')
  @ApiOperation({ summary: 'Update an admin user account' })
  @ApiBody({ type: UpdateAdminUserAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Admin user account updated successfully',
    type: AdminUserAccount,
  })
  async update(
    @Param('id') id: string,
    @Body() updateAdminUserAccountDto: UpdateAdminUserAccountDto,
  ): Promise<AdminUserAccount> {
    const command = new UpdateAdminUserAccountCommand(
      id,
      updateAdminUserAccountDto,
    );
    return this.commandBus.execute(command);
  }

  @Delete(':id')
  @Permissions('delete:admin_user:AdminUsers')
  @ApiOperation({ summary: 'Delete an admin user account' })
  @ApiResponse({
    status: 200,
    description: 'Admin user account deleted successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the admin user account to delete',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new RemoveAdminUserAccountCommand(id));
  }
}
