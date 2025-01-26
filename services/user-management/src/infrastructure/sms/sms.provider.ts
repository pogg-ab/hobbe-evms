import { Injectable } from '@nestjs/common';

@Injectable()
export class SMSProvider {
  async sendSMS(
    sms: any,
  ): Promise<{ status: 'SENT' | 'FAILED' | 'DELIVERED' }> {
    console.log(`Sending SMS to ${sms.recipient}: ${sms.message}`);

    return {
      status: 'DELIVERED',
    };
  }
}
