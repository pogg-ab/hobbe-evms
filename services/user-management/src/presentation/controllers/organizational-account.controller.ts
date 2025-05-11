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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrganizationalAccountCommand } from 'src/application/commands/organizational-account/create-organizational-account.command';
import { RemoveOrganizationalAccountCommand } from 'src/application/commands/organizational-account/remove-organizational-account.command';
import { UpdateOrganizationalAccountCommand } from 'src/application/commands/organizational-account/update-organizational-account.command';
import { SendEmailVerificationCommand } from 'src/application/commands/personal-account/send-email-verification.command';
import { SendEmailVerificationDbCommand } from 'src/application/commands/personal-account/send-email-verification.Dbcommand';
import { VerifyEmailCommand } from 'src/application/commands/personal-account/verify-email.command';
import { FindAllOrganizationalAccountsQuery } from 'src/application/queries/organizational-account/find-all-organizational-accounts.query';
import { FindOrganizationalAccountByIdQuery } from 'src/application/queries/organizational-account/find-organizational-account-by-id.query';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { OrganizationalAccountID } from 'src/domain/value-objects/organizational-account-id.value-object';
import { CreateOrganizationalAccountDto } from '../dtos/create-organizational-account.dto';
import { SendEmailVerificationDto } from '../dtos/send-email-verification.dto';
import { UpdateOrganizationalAccountDto } from '../dtos/update-organizational-account.dto';
import { VerifyEmailDto } from '../dtos/verify-email.dto';

@ApiTags('Organizational Account')
@Controller('organizational-account')
export class OrganizationalAccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

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

  @Get()
  @ApiOperation({ summary: 'Get all organizational accounts' })
  @ApiResponse({
    status: 200,
    description: 'List of all organizational accounts',
    type: [OrganizationalAccount],
  })
  async findAll(): Promise<OrganizationalAccount[]> {
    const query = new FindAllOrganizationalAccountsQuery();
    return this.queryBus.execute(query);
  }

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
    @Param('id') id: OrganizationalAccountID,
  ): Promise<OrganizationalAccount | null> {
    const query = new FindOrganizationalAccountByIdQuery(id);
    return this.queryBus.execute(query);
  }

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
    @Param('id') id: OrganizationalAccountID,
    @Body() updateOrganizationalAccountDto: UpdateOrganizationalAccountDto,
  ): Promise<OrganizationalAccount> {
    const command = new UpdateOrganizationalAccountCommand(
      id,
      updateOrganizationalAccountDto,
    );
    return this.commandBus.execute(command);
  }

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
    const command = new RemoveOrganizationalAccountCommand(id);
    return this.commandBus.execute(command);
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
