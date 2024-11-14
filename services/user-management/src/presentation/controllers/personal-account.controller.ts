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
import { CreatePersonalAccountCommand } from 'src/application/commands/personal-account/create-personal-account.command';
import { RemovePersonalAccountCommand } from 'src/application/commands/personal-account/remove-personal-account.command';
import { SendEmailVerificationCommand } from 'src/application/commands/personal-account/send-email-verification.command';
import { SendEmailVerificationDbCommand } from 'src/application/commands/personal-account/send-email-verification.Dbcommand';
import { UpdatePersonalAccountCommand } from 'src/application/commands/personal-account/update-personal-account.command';
import { VerifyEmailCommand } from 'src/application/commands/personal-account/verify-email.command';
import { FindAllPersonalAccountsQuery } from 'src/application/queries/personal-account/find-all-personal-accounts.query';
import { FindPersonalAccountByIdQuery } from 'src/application/queries/personal-account/find-personal-account-by-id.query';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { PersonalAccountID } from 'src/domain/value-objects/personal-account-id.value-object';
import { CreatePersonalAccountDto } from '../dtos/create-personal-account.dto';
import { SendEmailVerificationDto } from '../dtos/send-email-verification.dto';
import { UpdatePersonalAccountDto } from '../dtos/update-personal-account.dto';
import { VerifyEmailDto } from '../dtos/verify-email.dto';

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
  async findOne(
    @Param('id') id: PersonalAccountID,
  ): Promise<PersonalAccount | null> {
    return this.queryBus.execute(new FindPersonalAccountByIdQuery(id));
  }

  @Put(':id')
  async update(
    @Param('id') id: PersonalAccountID,
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
  async remove(@Param('id') id: PersonalAccountID): Promise<void> {
    return this.commandBus.execute(new RemovePersonalAccountCommand(id));
  }

  @Post('send-email-verification-registration')
  @ApiOperation({ summary: 'Send email verification code during registration' })
  @ApiBody({
    type: SendEmailVerificationDto,
    description: 'Email address for registration',
  })
  @ApiResponse({
    status: 200,
    description:
      'Email verification code sent successfully during registration.',
  })
  @ApiResponse({
    status: 404,
    description: 'Personal Account not found during registration.',
  })
  async sendEmailVerificationRegistration(
    @Body() sendEmailVerificationDto: SendEmailVerificationDto,
  ): Promise<{ message: string }> {
    try {
      const command = new SendEmailVerificationCommand(
        sendEmailVerificationDto,
      );
      await this.commandBus.execute(command);

      return {
        message:
          'Email verification code sent successfully during registration.',
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('send-email-verification-after-registration')
  @ApiOperation({ summary: 'Send email verification code after registration' })
  @ApiBody({
    type: SendEmailVerificationDto,
    description: 'Email address for post-registration verification',
  })
  @ApiResponse({
    status: 200,
    description:
      'Email verification code sent successfully after registration.',
  })
  @ApiResponse({
    status: 404,
    description: 'Personal Account not found after registration.',
  })
  async sendEmailVerificationAfterRegistration(
    @Body() sendEmailVerificationDto: SendEmailVerificationDto,
  ): Promise<{ message: string }> {
    try {
      const command = new SendEmailVerificationDbCommand(
        sendEmailVerificationDto,
      );
      await this.commandBus.execute(command);

      return {
        message:
          'Email verification code sent successfully after registration.',
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify user email address' })
  @ApiBody({ type: VerifyEmailDto })
  @HttpCode(200)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    try {
      const command = new VerifyEmailCommand(verifyEmailDto);
      const result = await this.commandBus.execute(command);

      if (!result) {
        throw new BadRequestException('Invalid email or verification code');
      }

      return { message: 'Email verified successfully' };
    } catch (error) {
      throw new BadRequestException('Email verification failed');
    }
  }
}
