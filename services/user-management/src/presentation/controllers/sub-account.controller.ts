import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSubAccountCommand } from 'src/application/commands/sub-account/create-sub-account.command';
import { RemoveSubAccountCommand } from 'src/application/commands/sub-account/remove-sub-account.command';
import { UpdateSubAccountCommand } from 'src/application/commands/sub-account/update-sub-account.command';
import { FindAllSubAccountsQuery } from 'src/application/queries/sub-account/find-all-sub-accounts.query';
import { FindSubAccountByIdQuery } from 'src/application/queries/sub-account/find-sub-account-by-id.query';
import { SubAccount } from 'src/domain/entities/sub-account.entity';
import { SubAccountID } from 'src/domain/value-objects/sub-account-id.value-object';
import { CreateSubAccountDto } from '../dtos/create-sub-account.dto';
import { UpdateSubAccountDto } from '../dtos/update-sub-account.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Sub Account')
@Controller('sub-account')
export class SubAccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new sub-account' })
  @ApiBody({ type: CreateSubAccountDto })
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'Sub-account created successfully',
    type: SubAccount,
  })
  async create(
    @Body() createSubAccountDto: CreateSubAccountDto,
  ): Promise<{ message: string; subAccount: SubAccount }> {
    try {
      const command = new CreateSubAccountCommand(createSubAccountDto);
      const subAccount = await this.commandBus.execute(command);
      return { message: 'Sub-account created successfully', subAccount };
    } catch (error) {
      throw new BadRequestException('Failed to create sub-account');
    }
  }

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all sub-accounts' })
  @ApiResponse({
    status: 200,
    description: 'List of all sub-accounts',
    type: [SubAccount],
  })
  async findAll(): Promise<SubAccount[]> {
    return this.queryBus.execute(new FindAllSubAccountsQuery());
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a sub-account by ID' })
  @ApiResponse({
    status: 200,
    description: 'Sub-account found',
    type: SubAccount,
  })
  @ApiResponse({
    status: 404,
    description: 'Sub-account not found',
  })
  async findOne(@Param('id') id: SubAccountID): Promise<SubAccount | null> {
    try {
      const query = new FindSubAccountByIdQuery(id);
      return this.queryBus.execute(query);
    } catch (error) {
      throw new BadRequestException('Sub-account not found');
    }
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a sub-account' })
  @ApiBody({ type: UpdateSubAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Sub-account updated successfully',
    type: SubAccount,
  })
  async update(
    @Param('id') id: SubAccountID,
    @Body() updateSubAccountDto: UpdateSubAccountDto,
  ): Promise<SubAccount> {
    try {
      const query = new FindSubAccountByIdQuery(id);
      const subAccount = await this.queryBus.execute(query);

      if (!subAccount) {
        throw new BadRequestException('Sub-account not found');
      }

      Object.assign(subAccount, updateSubAccountDto);
      const command = new UpdateSubAccountCommand(id, subAccount);
      return this.commandBus.execute(command);
    } catch (error) {
      throw new BadRequestException('Failed to update sub-account');
    }
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a sub-account' })
  @ApiResponse({
    status: 200,
    description: 'Sub-account deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Sub-account not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      const command = new RemoveSubAccountCommand(id);
      await this.commandBus.execute(command);
    } catch (error) {
      throw new BadRequestException('Failed to delete sub-account');
    }
  }
}
