import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePersonalAccountCommand } from 'src/application/personal-account/commands/create-personal-account.command';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { CreatePersonalAccountDto } from '../dtos/create-personal-account.dto';

@ApiTags('Personal Account')
@Controller('personal-account')
export class PersonalAccountController {
  constructor(private readonly commandBus: CommandBus) {}

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

  // @Get()
  // async findAll(): Promise<PersonalAccount[]> {
  //   return this.commandBus.execute(new FindAllPersonalAccountsQuery());
  // }

  // @Get(':id')
  // async findOne(@Param('id') id: string): Promise<PersonalAccount | null> {
  //   return this.commandBus.execute(new FindPersonalAccountByIdQuery(+id));
  // }

  // @Patch(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updatePersonalAccountDto: UpdatePersonalAccountDto,
  // ): Promise<PersonalAccount> {
  //   const account = await this.commandBus.execute(new FindPersonalAccountByIdQuery(+id));
  //   if (!account) throw new Error('Account not found');
  //   Object.assign(account, updatePersonalAccountDto);
  //   return this.commandBus.execute(new UpdatePersonalAccountCommand(account));
  // }

  // @Delete(':id')
  // async remove(@Param('id') id: string): Promise<void> {
  //   return this.commandBus.execute(new RemovePersonalAccountCommand(+id));
  // }
}
