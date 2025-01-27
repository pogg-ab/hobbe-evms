import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { User } from 'src/domain/entities/user.entity';
import { IPersonalAccountRepository } from 'src/domain/repositories/personal-account.repository';
import { PERSONAL_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/personal-account.repository.token';
// import { IUserRoleRepository } from 'src/domain/repositories/user-role.repository';
// import { USER_ROLE_REPOSITORY_TOKEN } from 'src/domain/repositories/user-role.repository.token';
import { Role } from 'src/domain/entities/role.entity';
import { UserRole } from 'src/domain/entities/user-role.entity';
import { IRoleRepository } from 'src/domain/repositories/role.repository';
import { ROLE_REPOSITORY_TOKEN } from 'src/domain/repositories/role.repository.token';
import { IUserRoleRepository } from 'src/domain/repositories/user-role.repository';
import { USER_ROLE_REPOSITORY_TOKEN } from 'src/domain/repositories/user-role.repository.token';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { PersonalAccountID } from 'src/domain/value-objects/personal-account-id.value-object';
import { MessageProducerService } from 'src/infrastructure/kafka/message.producer.service';
import { SendEmailVerificationDto } from 'src/presentation/dtos/send-email-verification.dto';
import { VerifyEmailResponse } from 'src/presentation/dtos/verify-email-response.interface';
import { VerifyEmailDto } from 'src/presentation/dtos/verify-email.dto';
import { DataSource } from 'typeorm';
import { CreatePersonalAccountDto } from '../../presentation/dtos/create-personal-account.dto';
import { UpdatePersonalAccountDto } from '../../presentation/dtos/update-personal-account.dto';

@Injectable()
export class PersonalAccountService {
  constructor(
    @Inject(PERSONAL_ACCOUNT_REPOSITORY_TOKEN)
    private readonly personalAccountRepository: IPersonalAccountRepository,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY_TOKEN)
    private readonly roleRepository: IRoleRepository,
    @Inject(USER_ROLE_REPOSITORY_TOKEN)
    private readonly userRoleRepository: IUserRoleRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private dataSource: DataSource,
    private readonly messageProducerService: MessageProducerService,
  ) {}
  async create(
    createPersonalAccountDto: CreatePersonalAccountDto,
  ): Promise<PersonalAccount> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.startTransaction();
    try {
      if (
        createPersonalAccountDto.password !==
        createPersonalAccountDto.confirmPassword
      ) {
        throw new BadRequestException(
          'Password and Confirm Password do not match',
        );
      }
      const newAccount = this.mapper.map(
        createPersonalAccountDto,
        CreatePersonalAccountDto,
        PersonalAccount,
      );
      const existingAccount = await this.personalAccountRepository.findByEmail(
        newAccount.email_address,
      );
      if (existingAccount) {
        throw new HttpException(
          `An account with the email ${newAccount.email_address} already exists.`,
          HttpStatus.CONFLICT,
        );
      }
      const savedAccount = await this.personalAccountRepository.create(
        queryRunner.manager,
        newAccount,
      );
      const user = this.mapper.map(
        createPersonalAccountDto,
        CreatePersonalAccountDto,
        User,
      );
      const otp = this.generateOtp();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
      user.password = await this.hashPassword(
        createPersonalAccountDto.password,
      );
      user.personal_account = savedAccount.personal_account_id;
      user.otp = otp;
      user.otp_expiry = otpExpiry;

      const newUser = await this.userRepository.create(
        queryRunner.manager,
        user,
      );

      const role = await this.getRoleByName('User');

      const userRole = new UserRole();
      userRole.user_id = newUser.user_id;
      userRole.role = role;
      await this.userRoleRepository.create(queryRunner.manager, userRole);

      await queryRunner.commitTransaction();

      const smsMessage = `Your OTP for Hobbe EVMS registration is ${otp}. Please enter this code to complete your registration. The code will expire in 10 minutes.`;
      const smsPayload = {
        phoneNumber: createPersonalAccountDto.phoneNumber,
        message: smsMessage,
        user: newUser,
        type: 'OTP',
        priority: null,
      };

      const smsResponse =
        await this.messageProducerService.sendSmsToKafka(smsPayload);

      // const smsResponse = await this.smsSenderService.sendSMS(
      //   createPersonalAccountDto.phoneNumber,
      //   smsMessage,
      //   newUser,
      //   'OTP',
      //   null,
      // );

      if ('error' in smsResponse) {
        const email = this.createOtpEmail(
          createPersonalAccountDto.emailAddress,
          otp,
        );
        const emailPayload = {
          to: user.user_name,
          subject: 'Your OTP for Hobbe EVMS',
          body: email.body,
          user,
        };
        const emailResponse =
          await this.messageProducerService.sendEmailToKafka(emailPayload);
        // const emailResponse = await this.emailService.sendEmail(email);

        if (!emailResponse) {
          await queryRunner.rollbackTransaction();
          throw new InternalServerErrorException(
            `Failed to send OTP via SMS and email. ${smsResponse.error ? `SMS failed: ${smsResponse.error}` : ''} ${emailResponse ? '' : 'Email sending failed.'}`,
          );
        }
      }

      return savedAccount;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the account.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }
  private createOtpEmail(recipient: string, otp: string): any {
    const email = {
      recipient: recipient,
      subject: 'Your OTP Code from Hobbe EVMS',
      body: otp,
      created_at: new Date(),
      updated_at: new Date(),
      sent_at: null,
    };

    return email;
  }

  private async getRoleByName(roleName: string): Promise<Role> {
    try {
      const role = await this.roleRepository.findOneBy({ name: roleName });
      if (!role) {
        throw new HttpException(
          `Role ${roleName} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return role;
    } catch (error) {
      throw new HttpException(
        `Error fetching role: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<PersonalAccount[]> {
    return this.personalAccountRepository.findAll();
  }

  async findOne(id: PersonalAccountID): Promise<PersonalAccount> {
    const account = await this.personalAccountRepository.findOneById(id);
    if (!account) {
      throw new NotFoundException(`Personal account with ID ${id} not found`);
    }
    return account;
  }

  async update(
    id: PersonalAccountID,
    updatePersonalAccountDto: UpdatePersonalAccountDto,
  ): Promise<PersonalAccount> {
    const account = await this.findOne(id);
    const updatedAccount = this.mapper.map(
      updatePersonalAccountDto,
      UpdatePersonalAccountDto,
      PersonalAccount,
    );
    await this.personalAccountRepository.update(id, updatedAccount);
    return updatedAccount;
  }

  async deletePersonalAccount(id: PersonalAccountID): Promise<void> {
    const account = await this.findOne(id);
    await this.personalAccountRepository.delete(id);
  }

  async sendEmailVerificationDb(
    sendEmailVerificationDto: SendEmailVerificationDto,
  ): Promise<any> {
    try {
      const personalAccount = await this.personalAccountRepository.findByEmail(
        sendEmailVerificationDto.email_address,
      );
      if (!personalAccount) {
        throw new HttpException(
          'Personal Account not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const otp = this.generateOtp();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

      personalAccount.email_verification_token = otp;
      personalAccount.email_verification_expires = otpExpiry;
      await this.personalAccountRepository.update(
        personalAccount.personal_account_id,
        personalAccount,
      );

      const email = this.createOtpEmail(
        sendEmailVerificationDto.email_address,
        otp,
      );

      await this.messageProducerService.sendEmailToKafka(email);
      // await this.emailService.sendEmail(email);

      return { message: 'Email verification code sent successfully.' };
    } catch (error) {
      throw new HttpException(
        `Error sending email verification code: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async sendEmailVerification(
    sendEmailVerificationDto: SendEmailVerificationDto,
  ): Promise<any> {
    try {
      const otp = this.generateOtp();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
      const email = this.createOtpEmail(
        sendEmailVerificationDto.email_address,
        otp,
      );

      await this.messageProducerService.sendEmailToKafka(email);

      // await this.emailService.sendEmail(email);

      return { message: 'Email verification code sent successfully.' };
    } catch (error) {
      throw new HttpException(
        `Error sending email verification code: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<VerifyEmailResponse> {
    const personalAccount = await this.personalAccountRepository.findByEmail(
      verifyEmailDto.email,
    );

    if (!personalAccount) {
      return {
        success: false,
        message: 'Account not found.',
        statusCode: 404,
      };
    }

    if (
      personalAccount.email_verification_token !==
      verifyEmailDto.verificationCode
    ) {
      return {
        success: false,
        message: 'Invalid verification code.',
        statusCode: 400,
      };
    }

    const currentTime = new Date();
    const tokenExpiryTime = new Date(
      personalAccount.email_verification_expires,
    );
    if (currentTime > tokenExpiryTime) {
      return {
        success: false,
        message: 'Verification token has expired.',
        statusCode: 410,
      };
    }

    personalAccount.is_email_verified = true;
    personalAccount.email_verification_token = null;
    await this.personalAccountRepository.update(
      personalAccount.personal_account_id,
      personalAccount,
    );

    return {
      success: true,
      message: 'Email successfully verified.',
      statusCode: 200,
    };
  }
}
