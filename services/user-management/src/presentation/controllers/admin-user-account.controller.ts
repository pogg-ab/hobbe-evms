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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAdminUserAccountCommand } from 'src/application/commands/admin-user-account/create-admin-user-account.command';
import { RemoveAdminUserAccountCommand } from 'src/application/commands/admin-user-account/remove-admin-user-account.command';
import { UpdateAdminUserAccountCommand } from 'src/application/commands/admin-user-account/update-admin-user-account.command';
import { FindAdminUserAccountByIdQuery } from 'src/application/queries/admin-user-account/find-admin-user-account-by-id.query';
import { FindAllAdminUserAccountsQuery } from 'src/application/queries/admin-user-account/find-all-admin-user-accounts.query';
import { AdminUserAccount } from 'src/domain/entities/admin-user-account.entity';
import { AdminUserAccountID } from 'src/domain/value-objects/admin-user-account-id.value-object';
import { CreateAdminUserAccountDto } from '../dtos/create-admin-user-account.dto';
import { UpdateAdminUserAccountDto } from '../dtos/update-admin-user-account.dto';

@ApiTags('Admin User Account')
@Controller('admin-user-account')
export class AdminUserAccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new admin user account' })
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

  @Get()
  // @Roles('Admin')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all admin user accounts' })
  @ApiResponse({
    status: 200,
    description: 'List of all admin user accounts',
    type: [AdminUserAccount],
  })
  async findAll(): Promise<AdminUserAccount[]> {
    return this.queryBus.execute(new FindAllAdminUserAccountsQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single admin user account by ID' })
  @ApiResponse({
    status: 200,
    description: 'Admin user account details',
    type: AdminUserAccount,
  })
  async findOne(
    @Param('id') id: AdminUserAccountID,
  ): Promise<AdminUserAccount | null> {
    return this.queryBus.execute(new FindAdminUserAccountByIdQuery(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an admin user account' })
  @ApiBody({ type: UpdateAdminUserAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Admin user account updated successfully',
    type: AdminUserAccount,
  })
  async update(
    @Param('id') id: AdminUserAccountID,
    @Body() updateAdminUserAccountDto: UpdateAdminUserAccountDto,
  ): Promise<AdminUserAccount> {
    const account = await this.queryBus.execute(
      new FindAdminUserAccountByIdQuery(id),
    );
    if (!account) throw new BadRequestException('Account not found');
    Object.assign(account, updateAdminUserAccountDto);
    return this.commandBus.execute(
      new UpdateAdminUserAccountCommand(id, account),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an admin user account' })
  @ApiResponse({
    status: 200,
    description: 'Admin user account deleted successfully',
  })
  async remove(@Param('id') id: AdminUserAccountID): Promise<void> {
    return this.commandBus.execute(new RemoveAdminUserAccountCommand(id));
  }
}
