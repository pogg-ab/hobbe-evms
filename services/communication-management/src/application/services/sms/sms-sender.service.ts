import { Inject, Injectable } from '@nestjs/common';
import { SMS } from 'src/domain/entities/sms.entity';
import { ISMSRepository } from 'src/domain/repositories/sms/sms.repository';
import { SMS_REPOSITORY_TOKEN } from 'src/domain/repositories/sms/sms.repository.token';
import { SMSProvider } from 'src/infrastructure/sms/sms.provider';

@Injectable()
export class SMSSenderService {
  constructor(
    @Inject(SMS_REPOSITORY_TOKEN)
    private readonly smsRepository: ISMSRepository,
    private readonly smsProvider: SMSProvider,
  ) {}

  async sendSMS(
    recipient: string,
    message: string,
    messageType: 'TEXT' | 'MMS' | 'OTP',
    priority: number | null,
  ): Promise<SMS | { status: string; error: string }> {
    const sms = new SMS();
    sms.recipient = recipient;
    sms.message = message;
    sms.status = 'PENDING';
    sms.sent_at = new Date();
    sms.delivery_report_at = null;
    sms.created_at = new Date();
    sms.updated_at = new Date();
    sms.message_type = messageType;
    sms.priority = priority;

    await this.smsRepository.create(sms);

    try {
      const response = await this.smsProvider.sendSMS(sms);

      if (response.status === 'DELIVERED') {
        sms.status = 'SENT';
        sms.sent_at = new Date();
        await this.smsRepository.updateStatus(sms.id, sms.status);
        return sms;
      } else {
        sms.status = 'FAILED';
        await this.smsRepository.updateStatus(sms.id, sms.status);
        return {
          status: 'FAILED',
          error: 'SMS sending failed: Message not delivered',
        };
      }
    } catch (error) {
      sms.status = 'FAILED';
      await this.smsRepository.updateStatus(sms.id, sms.status);
      return {
        status: 'FAILED',
        error: `Failed to send SMS: ${error.message}`,
      };
    }
  }
}
