import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Chapa } from 'chapa-nodejs';
import { ConfigService } from '@nestjs/config';
import { CreateChapaPayDto } from 'src/presentation/dtos/chapa/create-chapa-pay.dto';
import axios from 'axios';
import { CREATE_PAYMENT_TOKEN } from 'src/domain/repositories/payments/payments.repository.token';
import { IPaymentsRepository } from 'src/domain/repositories/payments/payments.repository';
import { Connection } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';
import { validate as uuidValidate } from 'uuid';
import { UUID } from 'crypto';
import { ChapaPayoutDto } from 'src/presentation/dtos/chapa/chapa-payout.dto';

@Injectable()
export class ChapaSDKService {
  private readonly logger = new Logger(ChapaSDKService.name);
  private chapa: Chapa;
  private readonly API_KEY: string;
  private readonly CALLBACK_BASE_URL: string;
  private readonly CHAPA_BASE_URL = 'https://api.chapa.co/v1';
  private readonly TRANSFER_ENDPOINT = `${this.CHAPA_BASE_URL}/transfers`;

  constructor(
    private readonly configService: ConfigService,
    @Inject(CREATE_PAYMENT_TOKEN)
    private readonly paymentRepository: IPaymentsRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {
    const secretKey = this.configService.get<string>('CHAPA_SECRET_KEY');
    if (!secretKey) {
      throw new Error('CHAPA_SECRET_KEY is not defined in the environment variables');
    }

    const callback_baseurl = this.configService.get<string>('CALLBACK_BASE_URL');
    if (!callback_baseurl) {
      throw new Error('CALLBACK_BASE_URL is not defined in the environment variables');
    }
    // Initialize Chapa SDK
    this.chapa = new Chapa({ secretKey });
    this.API_KEY = secretKey;
    this.CALLBACK_BASE_URL = callback_baseurl;

    // Log mode based on API key
    const isTestMode = secretKey.startsWith('CHAPUBK_TEST-');
    this.logger.log(`Chapa SDK initialized in ${isTestMode ? 'TEST' : 'LIVE'} MODE`);
    if (!isTestMode) {
      this.logger.warn('Using a LIVE Chapa API key. For testing, use a key that starts with CHAPUBK_TEST-');
    }
  }

  async paymentInit(chapaPayDto: CreateChapaPayDto): Promise<any> {
    try {
      const tx_ref = await this.generateReference();
      const response = await this.chapa.initialize({
        phone_number: chapaPayDto.phone_number,
        currency: chapaPayDto.currency,
        amount: chapaPayDto.amount,
        tx_ref,
        return_url: `${this.CALLBACK_BASE_URL}/chapa/verify/${tx_ref}`,
      });

      const paymentDto = {
        ...chapaPayDto,
        // user_id:"849b4dda-fc2b-452d-bc12-e8dd0bc8b6f3",
        tx_ref: tx_ref,
        payment_method: "Chapa",
      }
      await this.paymentRepository.create(paymentDto);

      return response;
    } catch (error) {
      console.error('Payment Init Error:', error.response?.data || error.message);
      throw new BadRequestException('Payment initialization failed', error);
    }
  }


  async verifyPayment(txRef: string): Promise<void> {
    try {
      const response = await axios.get(`${this.CHAPA_BASE_URL}/transaction/verify/${txRef}`, {
        headers: { Authorization: `Bearer ${this.API_KEY}` },
      });

      const paymentData = response.data.data;


      const verifiedPayment = await this.paymentRepository.verifyChapaPayment("Chapa", txRef, response.data.data.charge);
      const paymentId = verifiedPayment.paymentStatus.id.toString();
      const userId = verifiedPayment.paymentStatus.user_id.toString();

      if (!uuidValidate(paymentId)) {
        throw new Error(`Invalid payment ID format: ${paymentId}`);
      }

      if (!uuidValidate(userId)) {
        throw new Error(`Invalid user ID format: ${userId}`);
      }

      await this.insertTransactionFunction(
        paymentId,
        paymentData.reference,
        paymentData.phone_number,
        userId,
        verifiedPayment.paymentStatus.currency,
        verifiedPayment.paymentStatus.payment_method,
        'Regular'
      );
      return verifiedPayment
    } catch (error) {
      console.error('Error verifying payment:', error.response?.data);
      throw new Error('Failed to verify payment');
    }
  }

  private async insertTransactionFunction(
    paymentId: UUID,
    externalRefNo: string,
    username: string,
    userId: UUID,
    currencyId: string,
    providerName: string,
    appliesToEventType: string = 'Regular'
  ): Promise<void> {
    try {
      await this.connection.query(
        `SELECT fn_insert_transaction($1::uuid, $2, $3, $4::uuid, $5, $6, $7)`,
        [paymentId, externalRefNo, username, userId, currencyId, providerName, appliesToEventType]
      );
      console.log(`✅ Transaction function executed for payment: ${paymentId}`);
    } catch (error) {
      console.error('Error calling transaction function:', error);
      throw new Error(`Failed to insert transaction: ${error.message}`);
    }
  }


  async payoutInit(chapaPayDto: ChapaPayoutDto) {
    try {
      const res = await axios.post(
        `${this.CHAPA_BASE_URL}/transfers`,
        {
          account_name: chapaPayDto.account_name,
          account_number: chapaPayDto.account_number,
          amount: chapaPayDto.amount,
          currency: 'ETB',
          bank_code: chapaPayDto.bank_code,
          reference: `HOBBE-PO-${Date.now()}`,
          narration: chapaPayDto.reference ?? 'Payout',
        },
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return res.data;
    } catch (error: any) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException(error.message, 500);
    }
  }

  async verifyPayout(reference: string) {
    try {
      const res = await axios.get(
        `${this.CHAPA_BASE_URL}/transfers/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
          },
        },
      );
      return res.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || { message: error.message },
        error.response?.status || 500,
      );
    }
  }


  async getTransactions(from?: string, to?: string, page = 1, per_page = 20) {
    try {
      const res = await axios.get(`${this.CHAPA_BASE_URL}/transactions`, {
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
        },
        params: { from, to, page, per_page },
      });
      return res.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || { message: error.message },
        error.response?.status || 500,
      );
    }
  }

  async getTransfers(from?: string, to?: string, page = 1, per_page = 20, status?: string) {
    try {
      const res = await axios.get(`${this.CHAPA_BASE_URL}/transfers`, {
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
        },
        params: { from, to, page, per_page, status },
      });
      return res.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || { message: error.message },
        error.response?.status || 500,
      );
    }
  }





  async generateReference(): Promise<string> {
    try {
      const ref = await this.chapa.genTxRef({
        removePrefix: false,
        prefix: 'TX',
        size: 20,
      });
      return ref;
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate transaction reference');
    }
  }


  async getSupportedBanks() {
    try {
      const res = await axios.get(`${this.CHAPA_BASE_URL}/banks`, {
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
        },
      });
      return res.data; // returns array of banks with name and code
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || { message: error.message },
        error.response?.status || 500,
      );
    }
  }



}
