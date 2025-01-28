import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { KYC } from 'src/domain/entities/kyc.entity';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { Owner } from 'src/domain/entities/owner.entity';
import { SocialMedia } from 'src/domain/entities/social-media.entity';
import { User } from 'src/domain/entities/user.entity';
import { IKYCRepository } from 'src/domain/repositories/kyc.repository';
import { KYC_REPOSITORY_TOKEN } from 'src/domain/repositories/kyc.repository.token';
import { IOrganizationalAccountRepository } from 'src/domain/repositories/organizational-account.repository';
import { ORGANIZATIONAL_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/organizational-account.repository.token';
import { IOwnerRepository } from 'src/domain/repositories/owner.repository';
import { OWNER_REPOSITORY_TOKEN } from 'src/domain/repositories/owner.repository.token';
import { ISocialMediaRepository } from 'src/domain/repositories/social-media.repository';
import { SOCIAL_MEDIA_REPOSITORY_TOKEN } from 'src/domain/repositories/social-media.repository.token';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { OrganizationalAccountID } from 'src/domain/value-objects/organizational-account-id.value-object';
import { MessageProducerService } from 'src/infrastructure/kafka/message.producer.service';
import { SendEmailVerificationDto } from 'src/presentation/dtos/send-email-verification.dto';
import { UpdateOrganizationalAccountDto } from 'src/presentation/dtos/update-organizational-account.dto';
import { VerifyEmailResponse } from 'src/presentation/dtos/verify-email-response.interface';
import { VerifyEmailDto } from 'src/presentation/dtos/verify-email.dto';
import { DataSource } from 'typeorm';
import { CreateOrganizationalAccountDto } from '../../presentation/dtos/create-organizational-account.dto';
import { MessageType } from 'src/presentation/dtos/create-sms.dto';

@Injectable()
export class OrganizationalAccountService {
  constructor(
    @Inject(ORGANIZATIONAL_ACCOUNT_REPOSITORY_TOKEN)
    private readonly organizationalAccountRepository: IOrganizationalAccountRepository,

    @Inject(OWNER_REPOSITORY_TOKEN)
    private readonly ownerRepository: IOwnerRepository,

    @Inject(KYC_REPOSITORY_TOKEN)
    private readonly kycRepository: IKYCRepository,

    @Inject(SOCIAL_MEDIA_REPOSITORY_TOKEN)
    private readonly socialMediaRepository: ISocialMediaRepository,

    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,

    private dataSource: DataSource,

    @InjectMapper() private readonly mapper: Mapper,
    private readonly messageProducerService: MessageProducerService,
  ) { }
  async create(createOrganizationalAccountDto: CreateOrganizationalAccountDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.startTransaction();
    try {
      if (
        createOrganizationalAccountDto.password !==
        createOrganizationalAccountDto.confirmPassword
      ) {
        throw new BadRequestException(
          'Password and Confirm Password do not match',
        );
      }
      const organizationalAccount = this.mapper.map(
        createOrganizationalAccountDto,
        CreateOrganizationalAccountDto,
        OrganizationalAccount,
      );

      const owner = this.mapper.map(
        createOrganizationalAccountDto,
        CreateOrganizationalAccountDto,
        Owner,
      );
      const savedOwner = await this.ownerRepository.create(
        queryRunner.manager,
        owner,
      );

      const kyc = this.mapper.map(
        createOrganizationalAccountDto,
        CreateOrganizationalAccountDto,
        KYC,
      );
      const savedKYC = await this.kycRepository.create(
        queryRunner.manager,
        kyc,
      );

      organizationalAccount.owner = savedOwner.owner_id;
      organizationalAccount.kyc = savedKYC.kyc_id;

      const savedAccount = await this.organizationalAccountRepository.create(
        queryRunner.manager,
        organizationalAccount,
      );

      const user = this.mapper.map(
        createOrganizationalAccountDto,
        CreateOrganizationalAccountDto,
        User,
      );
      user.password = await this.hashPassword(
        createOrganizationalAccountDto.password,
      );
      user.organizational_account = savedAccount.organizational_account_id;
      await this.userRepository.create(queryRunner.manager, user);

      const socialMedia = this.mapper.map(
        createOrganizationalAccountDto,
        CreateOrganizationalAccountDto,
        SocialMedia,
      );

      socialMedia.organizational_account =
        savedAccount.organizational_account_id;

      await this.socialMediaRepository.create(queryRunner.manager, socialMedia);

      await queryRunner.commitTransaction();

      const otp = this.generateOtp();

      const smsMessage = `Your OTP for Hobbe EVMS registration is ${otp}. Please enter this code to complete your registration. The code will expire in 10 minutes.`;

      const smsPayload = {
        recipient: createOrganizationalAccountDto.companyPhoneNumber,
        message: smsMessage,
        messageType: MessageType.OTP,
      };

      const smsResponse =
        await this.messageProducerService.sendSmsToKafka(smsPayload);
      // const smsResponse = await this.smsSenderService.sendSMS(
      //   createOrganizationalAccountDto.companyPhoneNumber,
      //   smsMessage,
      //   user,
      //   'OTP',
      //   null,
      // );

      if ('error' in smsResponse) {
        const email = this.createOtpEmail(
          createOrganizationalAccountDto.companyEmail,
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
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the account.',
      );
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

  findAll() {
    return this.organizationalAccountRepository.find();
  }

  async findOneById(
    id: OrganizationalAccountID,
  ): Promise<OrganizationalAccount> {
    const role = await this.organizationalAccountRepository.findOneById(id);
    return role;
  }

  update(
    id: OrganizationalAccountID,
    updateOrganizationalAccountDto: UpdateOrganizationalAccountDto,
  ) {
    return `This action updates a #${id} organizationalAccount`;
  }

  async deleteOrganizationalAccount(id: string): Promise<void> {
    await this.organizationalAccountRepository.delete(id);
  }

  async sendEmailVerificationDb(
    sendEmailVerificationDto: SendEmailVerificationDto,
  ): Promise<any> {
    try {
      const organizationalAccount =
        await this.organizationalAccountRepository.findByEmail(
          sendEmailVerificationDto.email_address,
        );
      if (!organizationalAccount) {
        throw new HttpException(
          'Personal Account not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const otp = this.generateOtp();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

      organizationalAccount.email_verification_token = otp;
      organizationalAccount.email_verification_expires = otpExpiry;
      await this.organizationalAccountRepository.update(
        organizationalAccount.organizational_account_id,
        organizationalAccount,
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
    const organizationalAccount =
      await this.organizationalAccountRepository.findByEmail(
        verifyEmailDto.email,
      );

    if (!organizationalAccount) {
      return {
        success: false,
        message: 'Account not found.',
        statusCode: 404,
      };
    }

    if (
      organizationalAccount.email_verification_token !==
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
      organizationalAccount.email_verification_expires,
    );
    if (currentTime > tokenExpiryTime) {
      return {
        success: false,
        message: 'Verification token has expired.',
        statusCode: 410,
      };
    }

    organizationalAccount.is_email_verified = true;
    organizationalAccount.email_verification_token = null;
    await this.organizationalAccountRepository.update(
      organizationalAccount.organizational_account_id,
      organizationalAccount,
    );

    return {
      success: true,
      message: 'Email successfully verified.',
      statusCode: 200,
    };
  }
}
