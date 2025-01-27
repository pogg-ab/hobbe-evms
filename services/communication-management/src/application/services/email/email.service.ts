import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { Email } from 'src/domain/entities/email.entity';
import { IEmailRepository } from 'src/domain/repositories/email/email.repository';
import { EMAIL_REPOSITORY_TOKEN } from 'src/domain/repositories/email/email.repository.token';
import { CreateEmailDto } from 'src/presentation/dto/email/create-email.dto';

@Injectable()
export class EmailService {
  constructor(
    @Inject(EMAIL_REPOSITORY_TOKEN)
    private readonly emailRepository: IEmailRepository,

    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async sendEmail(
    createEmailDto: CreateEmailDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const email = this.mapper.map(createEmailDto, CreateEmailDto, Email);
      await this.emailRepository.save(email);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, message: 'Failed to send email' };
    }
  }

  async getAllEmails(): Promise<Email[]> {
    return this.emailRepository.find();
  }
}
