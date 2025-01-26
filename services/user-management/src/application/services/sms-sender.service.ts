import { Injectable } from '@nestjs/common';
import { SMS } from 'src/domain/entities/sms.entity';
import { ISMSRepository } from 'src/domain/repositories/sms.repository';
import { SMSID } from 'src/domain/value-objects/sms-id.value-object';
import { SMSProvider } from 'src/infrastructure/sms/sms.provider';

@Injectable()
export class SMSSenderService {
  constructor(
    private readonly smsRepository: ISMSRepository,
    private readonly smsProvider: SMSProvider,
  ) {}

  async sendSMS(
    recipient: string,
    message: string,
    userId: string,
    messageType: 'TEXT' | 'MMS' | 'OTP',
    priority: number | null,
  ): Promise<SMS> {
    const sms = new SMS();
    sms.id = new SMSID();
    sms.recipient = recipient;
    sms.message = message;
    sms.status = 'PENDING';
    sms.sent_at = new Date();
    sms.delivery_report_at = null;
    sms.created_at = new Date();
    sms.updated_at = new Date();
    sms.user_id = userId;
    sms.message_type = messageType;
    sms.priority = priority;

    await this.smsRepository.create(sms);

    try {
      const response = await this.smsProvider.sendSMS(sms);

      sms.status = response.status === 'DELIVERED' ? 'SENT' : 'FAILED';
      sms.sent_at = response.status === 'DELIVERED' ? new Date() : null;

      await this.smsRepository.updateStatus(sms.id, sms.status);
    } catch (error) {
      sms.status = 'FAILED';
      await this.smsRepository.updateStatus(sms.id, sms.status);
      throw new Error('Failed to send SMS');
    }

    return sms;
  }

  private generateUUID(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
