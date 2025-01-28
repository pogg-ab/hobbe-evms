import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SMSProvider {
  private readonly identifierId: string;
  private readonly senderName: string;
  private readonly callbackUrl: string;
  private readonly apiUrl: string;
  private readonly apiToken: string;
  constructor() {
    this.identifierId = process.env.SMS_IDENTIFIER_ID;
    this.senderName = process.env.SMS_SENDER_NAME;
    this.callbackUrl = process.env.SMS_CALLBACK_URL;
    this.apiUrl = process.env.SMS_API_URL;
    this.apiToken = process.env.SMS_API_TOKEN;
  }
  async sendSMS(
    sms: any,
  ): Promise<{ status: 'SENT' | 'FAILED' | 'DELIVERED' }> {
    try {
      const { recipient, message } = sms;

      const requestUrl = `${this.apiUrl}?from=${this.identifierId}&to=${
        recipient
      }&message=${message}
      )}`;
      const headers = {
        Authorization: `Bearer ${this.apiToken}`,
      };
      const response = await axios.get(requestUrl, { headers });
      if (response.data.acknowledge === 'success') {
        console.log(`SMS sent to ${recipient}: ${message}`);
        console.log(`Message ID: ${response.data.response.message_id}`);
        return { status: 'DELIVERED' };
      }

      if (response.data.acknowledge === 'error') {
        console.error('Error sending SMS:', response.data.response.errors);
        return { status: 'FAILED' };
      }

      console.error('Unexpected response format:', response.data);
      return { status: 'FAILED' };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return { status: 'FAILED' };
    }
  }
}
