import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Email } from 'src/domain/entities/email.entity';
import { IEmailRepository } from 'src/domain/repositories/email.repository';
import { Repository } from 'typeorm';
import { EmailSenderService } from '../../email/email-sender.service';

@Injectable()
export class EmailRepositoryImpl implements IEmailRepository {
  constructor(
    private readonly emailSenderService: EmailSenderService,
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>,
  ) {}

  async save(email: Email): Promise<void> {
    try {
      const newEmail = this.emailRepository.create(email);
      newEmail.sent_at = new Date();
      await this.emailRepository.save(newEmail);
      await this.emailSenderService.sendEmail(newEmail);
    } catch (error) {
      throw new HttpException(
        `Error saving and sending email: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async find(): Promise<Email[]> {
    try {
      return await this.emailRepository.find();
    } catch (error) {
      throw new HttpException(
        `Error fetching emails: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
