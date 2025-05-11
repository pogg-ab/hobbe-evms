import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CREATE_PAYMENT_TOKEN } from 'src/domain/repositories/payments/payments.repository.token';
import { CreateChapaPayDto } from 'src/presentation/dtos/chapa/create-chapa-pay.dto';

@Injectable()
export class ChapaService {
  private readonly logger = new Logger(ChapaService.name);
  private readonly API_KEY: string;
  private readonly BASE_URL = 'https://api.chapa.co/v1';

  constructor(
    @Inject(CREATE_PAYMENT_TOKEN)
    private readonly configService: ConfigService
  ) {
    this.API_KEY = this.configService.get<string>('CHAPA_SECRET_KEY');
  }

  async initializePayment(data: CreateChapaPayDto) {
    try {
    //   console.log('Request data:', data);
      
      const response = await axios.post(`${this.BASE_URL}/transaction/initialize`, data, {
        headers: { Authorization: `Bearer ${this.API_KEY}` },
      });

      return response.data;
    } catch (error) {
      console.error('Error response:', error.response?.data);
      throw new Error('Failed to initialize payment');
    }
  }

  async verifyPayment(txRef: string) {
    try {
      const response = await axios.get(`${this.BASE_URL}/transaction/verify/${txRef}`, {
        headers: { Authorization: `Bearer ${this.API_KEY}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error.response?.data);
      throw new Error('Failed to verify payment');
    }
  }


  async handleWebhook(data: any) {
    this.logger.log('Received Chapa Webhook:', data);

    if (data.status === 'success') {
      const txRef = data.tx_ref;
      const verification = await this.verifyPayment(txRef);
      if (verification.status === 'success') {
        // Process successful payment
        this.logger.log(`Payment successful for ${txRef}`);
        return { message: 'Payment verified', data: verification };
      }
    }
    this.logger.warn('Payment verification failed or incomplete');
    return { message: 'Payment not verified', data: null };
  }
}
