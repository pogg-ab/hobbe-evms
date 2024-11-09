import {
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
import { CreatePersonalAccountCommand } from 'src/application/commands/personal-account/create-personal-account.command';
import { RemovePersonalAccountCommand } from 'src/application/commands/personal-account/remove-personal-account.command';
import { UpdatePersonalAccountCommand } from 'src/application/commands/personal-account/update-personal-account.command';
import { FindAllPersonalAccountsQuery } from 'src/application/queries/personal-account/find-all-personal-accounts.query';
import { FindPersonalAccountByIdQuery } from 'src/application/queries/personal-account/find-personal-account-by-id.query';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { CreatePersonalAccountDto } from '../dtos/create-personal-account.dto';
import { UpdatePersonalAccountDto } from '../dtos/update-personal-account.dto';

@ApiTags('Personal Account')
@Controller('personal-account')
export class PersonalAccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new personal account' })
  @ApiBody({ type: CreatePersonalAccountDto })
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    type: PersonalAccount,
  })
  async create(
    @Body() createPersonalAccountDto: CreatePersonalAccountDto,
  ): Promise<{ message: string; account: PersonalAccount }> {
    const command = new CreatePersonalAccountCommand(createPersonalAccountDto);
    const createdAccount = await this.commandBus.execute(command);

    return {
      message: 'Account created successfully',
      account: createdAccount,
    };
  }

  @Get()
  async findAll(): Promise<PersonalAccount[]> {
    return this.queryBus.execute(new FindAllPersonalAccountsQuery());
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PersonalAccount | null> {
    return this.queryBus.execute(new FindPersonalAccountByIdQuery(id));
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePersonalAccountDto: UpdatePersonalAccountDto,
  ): Promise<PersonalAccount> {
    const account = await this.commandBus.execute(
      new FindPersonalAccountByIdQuery(id),
    );
    if (!account) throw new Error('Account not found');
    Object.assign(account, updatePersonalAccountDto);
    return this.commandBus.execute(
      new UpdatePersonalAccountCommand(id, account),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new RemovePersonalAccountCommand(id));
  }
}
