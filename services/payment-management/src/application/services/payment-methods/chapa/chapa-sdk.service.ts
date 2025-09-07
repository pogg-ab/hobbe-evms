import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Chapa } from 'chapa-nodejs';
import { ConfigService } from '@nestjs/config';
import { CreateChapaPayDto } from 'src/presentation/dtos/chapa/create-chapa-pay.dto';
import axios from 'axios';
import { CreatePaymentDto } from 'src/presentation/dtos/payments/create-payments.dto';
import { Payments } from 'src/domain/entities/payments.entity';
import { PaymentsService } from '../../payments/payments.service';
import { CREATE_PAYMENT_TOKEN } from 'src/domain/repositories/payments/payments.repository.token';
import { IPaymentsRepository } from 'src/domain/repositories/payments/payments.repository';
import { Connection } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';
import { validate as uuidValidate } from 'uuid';
import { UUID } from 'crypto';


@Injectable()
export class ChapaSDKService {
  private chapa: Chapa;
  private readonly API_KEY: string;
  private readonly CALLBACK_BASE_URL: string;
  private readonly BASE_URL = 'https://api.chapa.co/v1';

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
    this.chapa = new Chapa({ secretKey });
    this.API_KEY = secretKey;
    this.CALLBACK_BASE_URL = callback_baseurl;
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
      const response = await axios.get(`${this.BASE_URL}/transaction/verify/${txRef}`, {
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
    providerName: string
  ): Promise<void> {
    try {
      await this.connection.query(
        `SELECT fn_insert_transaction($1::uuid, $2, $3, $4::uuid, $5, $6)`,
        [paymentId, externalRefNo, username, userId, currencyId, providerName]
      );
      console.log(`✅ Transaction function executed for payment: ${paymentId}`);
    } catch (error) {
      console.error('Error calling transaction function:', error);
      throw new Error(`Failed to insert transaction: ${error.message}`);
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
}
