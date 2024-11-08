import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrganizationalAccountCommand } from 'src/application/commands/organizational-account/create-organizational-account.command';
import { RemoveOrganizationalAccountCommand } from 'src/application/commands/organizational-account/remove-organizational-account.command';
import { UpdateOrganizationalAccountCommand } from 'src/application/commands/organizational-account/update-organizational-account.command';
import { FindAllOrganizationalAccountsQuery } from 'src/application/queries/organizational-account/find-all-organizational-accounts.query';
import { FindOrganizationalAccountByIdQuery } from 'src/application/queries/organizational-account/find-organizational-account-by-id.query';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { CreateOrganizationalAccountDto } from '../dtos/create-organizational-account.dto';
import { UpdateOrganizationalAccountDto } from '../dtos/update-organizational-account.dto';

@ApiTags('Organizational Account')
@Controller('organizational-account')
export class OrganizationalAccountController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organizational account' })
  @ApiBody({ type: CreateOrganizationalAccountDto })
  @ApiResponse({
    status: 201,
    description: 'Organizational account created successfully',
    type: OrganizationalAccount,
  })
  async create(
    @Body() createOrganizationalAccountDto: CreateOrganizationalAccountDto,
  ) {
    const command = new CreateOrganizationalAccountCommand(
      createOrganizationalAccountDto,
    );
    const createdAccount = await this.commandBus.execute(command);

    return {
      message: 'Organizational account created successfully',
      account: createdAccount,
    };
  }

  // Get All Organizational Accounts
  @Get()
  @ApiOperation({ summary: 'Get all organizational accounts' })
  @ApiResponse({
    status: 200,
    description: 'List of all organizational accounts',
    type: [OrganizationalAccount],
  })
  async findAll(): Promise<OrganizationalAccount[]> {
    const query = new FindAllOrganizationalAccountsQuery();
    return this.commandBus.execute(query);
  }

  // Get Organizational Account by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get an organizational account by ID' })
  @ApiResponse({
    status: 200,
    description: 'Organizational account found',
    type: OrganizationalAccount,
  })
  @ApiResponse({
    status: 404,
    description: 'Organizational account not found',
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<OrganizationalAccount | null> {
    const query = new FindOrganizationalAccountByIdQuery(+id);
    return this.commandBus.execute(query);
  }

  // Update Organizational Account
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing organizational account' })
  @ApiBody({ type: UpdateOrganizationalAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Organizational account updated successfully',
    type: OrganizationalAccount,
  })
  @ApiResponse({
    status: 404,
    description: 'Organizational account not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationalAccountDto: UpdateOrganizationalAccountDto,
  ): Promise<OrganizationalAccount> {
    const command = new UpdateOrganizationalAccountCommand(
      +id,
      updateOrganizationalAccountDto,
    );
    return this.commandBus.execute(command);
  }

  // Delete Organizational Account
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an organizational account' })
  @ApiResponse({
    status: 204,
    description: 'Organizational account deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Organizational account not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    const command = new RemoveOrganizationalAccountCommand(+id);
    return this.commandBus.execute(command);
  }
}
