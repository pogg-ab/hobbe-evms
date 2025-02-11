import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class WiseService {
  public  apiUrl = '';
  public  authToken = ''; // Store in .env

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('WISE_API_URL');
    this.authToken = this.configService.get<string>('WISE_API_KEY');
  }
  // 1. Get Wise Profile ID
  async getProfileId(): Promise<{id:string,email:string}> {
    try {
      const response = await axios.get(`${this.apiUrl}/profiles`, {
        headers: { Authorization: `Bearer ${this.authToken}` },
      });
      return {id:response.data[0]?.id,email:response.data[0]?.email}; // Assuming first profile
    } catch (error) {
      throw new HttpException('Error fetching Wise profile', HttpStatus.BAD_REQUEST);
    }
  }

  // 2. Create a Transfer Quote
  async createQuote(sourceCurrency: string, targetCurrency: string, amount: number) {
    const profileId = await this.getProfileId();
    if (!profileId) throw new HttpException('Profile ID not found', HttpStatus.BAD_REQUEST);
  
    try {
      const response = await axios.post(
        `${this.apiUrl}/quotes`,
        {
          profile: profileId,
          source: sourceCurrency, // Fix: Ensure correct key
          target: targetCurrency, // Fix: Ensure correct key
          targetAmount: amount,
          rateType: 'FIXED', // Fix: Required field (other option: "VARIABLE")
        },
        {
          headers: { Authorization: `Bearer ${this.authToken}` },
        },
      );
  
      return response.data;
    } catch (error) {
      console.error('Wise API error:', error.response?.data || error.message);
      throw new HttpException(error.response?.data || 'Error creating quote', HttpStatus.BAD_REQUEST);
    }
  }
  

  // 3. Create a Transfer
  async createTransfer(targetAccountId: number, quoteId: string) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/transfers`,
        {
          targetAccount: targetAccountId,
          quote: quoteId,
          customerTransactionId: `${Date.now()}`,
        },
        {
          headers: { Authorization: `Bearer ${this.authToken}` },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Error creating transfer', HttpStatus.BAD_REQUEST);
    }
  }

  // 4. Fund the Transfer
  async fundTransfer(transferId: string) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/transfers/${transferId}/payments`,
        {
          type: 'BALANCE',
        },
        {
          headers: { Authorization: `Bearer ${this.authToken}` },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Error funding transfer', HttpStatus.BAD_REQUEST);
    }
  }

  // 5. Check Transfer Status
  async getTransferStatus(transferId: string) {
    try {
      const response = await axios.get(`${this.apiUrl}/transfers/${transferId}`, {
        headers: { Authorization: `Bearer ${this.authToken}` },
      });
      return response.data.status;
    } catch (error) {
      throw new HttpException('Error fetching transfer status', HttpStatus.BAD_REQUEST);
    }
  }



  // Check transfer status every 5 minutes
  // @Cron(CronExpression.EVERY_5_MINUTES)
  // async checkTransferStatuses() {
  //   console.log('Checking Wise transfer statuses...');
  //   // Fetch ongoing transfers from your database and check their status
  // }
}
