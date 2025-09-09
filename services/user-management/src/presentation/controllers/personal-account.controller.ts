import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
import { Roles } from '../decorators/roles.decorator';
import { CreatePersonalAccountDto } from '../dtos/create-personal-account.dto';
import { SendEmailVerificationDto } from '../dtos/send-email-verification.dto';
import { UpdatePersonalAccountDto } from '../dtos/update-personal-account.dto';
import { VerifyEmailDto } from '../dtos/verify-email.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
// import { File } from 'multer';
import { Express } from 'express'
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/infrastructure/file-upload/multer.config';
import * as path from 'path';
import { Response } from 'express';
import { CurrentUserId } from '../decorators/currentUserId.decorater';
import { UpdateProfileImageCommand } from 'src/application/commands/personal-account/update-profile-image-command';
import { AuditLogInterceptor } from '../interceptors/audit-log.interceptor';
@ApiTags('Personal Account')
@Controller('personal-account')
@UseInterceptors(AuditLogInterceptor) 
export class PersonalAccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new personal account' })
  @ApiBody({ type: CreatePersonalAccountDto })
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    type: PersonalAccount,
  })
  @UseInterceptors(FileInterceptor('profile_image', multerConfig('profile_image')))
  async create(
    @Body() createPersonalAccountDto: CreatePersonalAccountDto,
    @UploadedFile() profile_image: Express.Multer.File,
  ): Promise<{ message: string; account: PersonalAccount }> {
    if (profile_image) {
      createPersonalAccountDto.profile_image = profile_image.path;
    }
    const command = new CreatePersonalAccountCommand(createPersonalAccountDto);
    const createdAccount = await this.commandBus.execute(command);

    return {
      message: 'Account created successfully',
      account: createdAccount,
    };
  }

  @Put(':id/profile-image')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update profile image of the account' })
  @ApiBody({ description: 'Profile image file to update the user profile' })
  @UseInterceptors(FileInterceptor('profile_image', multerConfig('profile_image')))
  async updateProfileImage(
    @Param('id') id: PersonalAccountID,
    @UploadedFile() profile_image: Express.Multer.File,
    @Res() res: Response,
  ): Promise<any> {
    if (!profile_image) {
      throw new BadRequestException('No profile image file uploaded');
    }
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(profile_image.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
    }

    const account: PersonalAccount | null = await this.queryBus.execute(
      new FindPersonalAccountByIdQuery(id),
    );

    if (!account) {
      throw new NotFoundException('Personal account not found');
    }

    await this.commandBus.execute(
      new UpdateProfileImageCommand(id, profile_image.path),
    );

    return res.status(200).json({
      message: 'Profile image updated successfully',
    });
  }


  @Get(':id/profile-image')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async getProfileImage(
    @Param('id') id: PersonalAccountID,
    @Res() res: Response,
  ): Promise<any> {
    const account: PersonalAccount | null = await this.queryBus.execute(
      new FindPersonalAccountByIdQuery(id),
    );

    if (!account || !account.profile_image) {
      throw new NotFoundException('Profile image not found.');
    }

    const filePath = path.join(__dirname, '..', '..', '..', account.profile_image);

    res.sendFile(filePath);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @Roles('Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: PersonalAccountID,
    @Body() updatePersonalAccountDto: UpdatePersonalAccountDto,
    @CurrentUserId() user: any,
  ): Promise<PersonalAccount> {
    const account = await this.queryBus.execute(
      new FindPersonalAccountByIdQuery(id),
    );

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
