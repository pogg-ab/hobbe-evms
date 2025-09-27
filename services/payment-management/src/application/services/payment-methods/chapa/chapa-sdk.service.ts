import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Chapa } from 'chapa-nodejs';
import { ConfigService } from '@nestjs/config';
import { CreateChapaPayDto } from 'src/presentation/dtos/chapa/create-chapa-pay.dto';
import axios from 'axios';
import { CREATE_PAYMENT_TOKEN } from 'src/domain/repositories/payments/payments.repository.token';
import { IPaymentsRepository } from 'src/domain/repositories/payments/payments.repository';
import { Connection, Repository } from 'typeorm';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { validate as uuidValidate } from 'uuid';
import { UUID } from 'crypto';
import { ChapaPayoutDto } from 'src/presentation/dtos/chapa/chapa-payout.dto';
import { CREATE_PAYOUT_TOKEN } from 'src/domain/repositories/payments/payouts.repository.token';
import { IPayoutsRepository } from 'src/domain/repositories/payments/payouts.repository';
import { KafkaRefundRpcService } from 'src/infrastructure/kafka/kafka.refund.rpc.service';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer.servicce';
import { Refund } from 'src/domain/entities/refund.entity';
import { ChapaCancelEventRefundDto } from 'src/presentation/dtos/chapa/chapa-cancel-event.refund.dto';
import { RefundRequest, RefundStatus } from 'src/domain/entities/refund-request.entity';

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
    @Inject(CREATE_PAYOUT_TOKEN)
    private readonly payoutRepository: IPayoutsRepository,
    private readonly kafkaRefundRpcService: KafkaRefundRpcService,
    @InjectConnection() private readonly connection: Connection,

    @InjectRepository(Refund)
    private refundRepository: Repository<Refund>,
    private readonly kafkaProducerService: KafkaProducerService,

    @InjectRepository(RefundRequest)
    private refundRequestRepository: Repository<RefundRequest>,
  ) {
    const secretKey = this.configService.get<string>('CHAPA_SECRET_KEY');
    if (!secretKey) {
      throw new Error(
        'CHAPA_SECRET_KEY is not defined in the environment variables',
      );
    }

    const callback_baseurl =
      this.configService.get<string>('CALLBACK_BASE_URL');
    if (!callback_baseurl) {
      throw new Error(
        'CALLBACK_BASE_URL is not defined in the environment variables',
      );
    }
    // Initialize Chapa SDK
    this.chapa = new Chapa({ secretKey });
    this.API_KEY = secretKey;
    this.CALLBACK_BASE_URL = callback_baseurl;

    // Log mode based on API key
    const isTestMode = secretKey.startsWith('CHAPUBK_TEST-');
    this.logger.log(
      `Chapa SDK initialized in ${isTestMode ? 'TEST' : 'LIVE'} MODE`,
    );
    if (!isTestMode) {
      this.logger.warn(
        'Using a LIVE Chapa API key. For testing, use a key that starts with CHAPUBK_TEST-',
      );
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
        payment_method: 'Chapa',
      };
      await this.paymentRepository.create(paymentDto);

      return response;
    } catch (error) {
      console.error(
        'Payment Init Error:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Payment initialization failed', error);
    }
  }


  async verifyPayment(txRef: string): Promise<void> {
    try {
      const response = await axios.get(
        `${this.CHAPA_BASE_URL}/transaction/verify/${txRef}`,
        {
          headers: { Authorization: `Bearer ${this.API_KEY}` },
        },
      );

      const paymentData = response.data.data;

      const verifiedPayment = await this.paymentRepository.verifyChapaPayment(
        'Chapa',
        txRef,
        response.data.data.reference,
        response.data.data.charge,
      );
      const paymentId = verifiedPayment.paymentStatus.id.toString();
      const userId = verifiedPayment.paymentStatus.user_id.toString();

      if (!uuidValidate(paymentId)) { throw new Error(`Invalid payment ID format: ${paymentId}`); }
      if (!uuidValidate(userId)) { throw new Error(`Invalid user ID format: ${userId}`); }

      await this.insertTransactionFunction(
        paymentId as UUID,
        paymentData.reference,
        paymentData.phone_number,
        userId as UUID,
        verifiedPayment.paymentStatus.currency,
        verifiedPayment.paymentStatus.payment_method,
        'Regular',
      );

     
      this.emitPaymentSuccessfulEvent(verifiedPayment.paymentStatus);
      
      return verifiedPayment; 

    } catch (error) {
      this.logger.error(`Error verifying payment for tx_ref: ${txRef}. Emitting failure event.`, error.stack);
      
      
      const paymentRecord = await this.paymentRepository.findByTxRef(txRef);
      if (paymentRecord) {
          this.emitPaymentFailedEvent(paymentRecord, error.message);
      } else {
          this.logger.error(`Could not find original payment record for failed tx_ref: ${txRef}.`);
      }
      
      
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
    appliesToEventType: string = 'Regular',
  ): Promise<void> {
    try {
      await this.connection.query(
        `SELECT fn_insert_transaction($1::uuid, $2, $3, $4::uuid, $5, $6, $7)`,
        [
          paymentId,
          externalRefNo,
          username,
          userId,
          currencyId,
          providerName,
          appliesToEventType,
        ],
      );
      console.log(`✅ Transaction function executed for payment: ${paymentId}`);
    } catch (error) {
      console.error('Error calling transaction function:', error);
      throw new Error(`Failed to insert transaction: ${error.message}`);
    }
  }

  async payoutInit(chapaPayDto: ChapaPayoutDto, userId: string) {
    const tx_ref = `HOBBE-PO-${Date.now()}`;
    try {
      const res = await axios.post(
        `${this.CHAPA_BASE_URL}/transfers`,
        {
          account_name: chapaPayDto.account_name,
          account_number: chapaPayDto.account_number,
          amount: chapaPayDto.amount,
          currency: 'ETB',
          bank_code: chapaPayDto.bank_code,
          reference: tx_ref,
          narration: chapaPayDto.narration ?? 'Payout',
        },
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const payoutDto = {
        ...chapaPayDto,
        user_id: userId,
        tx_ref: tx_ref,
        payment_method: 'Chapa',
      };
      await this.payoutRepository.create(payoutDto);

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

      console.log('Payout verification status:', res);

      if (res.data.data.status !== 'success') {
        throw new HttpException(
          `Payout with reference ${reference} waiting for HoBBE Admin Approval or is not successful`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const paid = await this.payoutRepository.verifyChapaPayout(
        'Chapa',
        reference,
        res.data.data.charge,
      );
      const data = paid.paymentStatus;

      const payoutTransaction = await this.insertPayoutTransaction(
        data.tx_ref,
        data.account_number,
        data.event_id,
        data.user_id,
        data.currency,
      );

      return res.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || { message: error.message },
        error.response?.status || 500,
      );
    }
  }

  private async insertPayoutTransaction(
    externalRefNo: string,
    username: string,
    eventId: UUID,
    userId: UUID,
    currencyId: string,
  ) {
    try {
      await this.connection.query(
        `SELECT fn_insert_payout_transaction($1::text, $2::text, $3::uuid, $4::uuid, $5::text)`,
        [externalRefNo, username, eventId, userId, currencyId],
      );
      console.log(
        `✅ Transaction function executed for payout: ${externalRefNo}`,
      );
    } catch (error) {
      console.error('Error calling transaction function:', error);
      throw new Error(`Failed to insert transaction: ${error.message}`);
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

  async getTransfers(
    from?: string,
    to?: string,
    page = 1,
    per_page = 20,
    status?: string,
  ) {
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

  async refundPayment(exRef: string, userId:string,reason?: string,): Promise<any> {
    try {
      //  check if txRef exists
      const payment = await this.paymentRepository.findByExRef(exRef);

      const refundCheck = await this.kafkaRefundRpcService.sendRequest(
        'refund-request-topic',
        { 
          bookingId: payment.booking_id, 
          eventId: payment.event_id,
          refundType:'auto'
         },
      );

      if(refundCheck.eligibleToRefund === false){
        //  find a refund request by paymentid and eventid and insert if not found else skip
        const existingRequest = await this.refundRequestRepository.findOne({
          where: { paymentid: payment.id.toString(), eventid: payment.event_id.toString() },
        });

        if(payment.payment_status === 'Refund In Progress' || payment.payment_status === 'Refunded'){
          return {message: `A refund is already in progress or has been completed for payment ${exRef}. Please wait for HoBBE admin to process it.`};
        }

        if(!existingRequest){
          await this.refundRequestRepository.save({
          paymentid: payment.id.toString(),
          userid: userId,
          eventid: payment.event_id.toString(),
          amount: payment.amount,
          currency: payment.currency,
          reason: reason,
          approval_level: 0,
          requested_at: new Date(),
          payment_gateway_ref: exRef,
          });
        }       
        return {message: `A refund request has been logged for payment ${exRef}. It is pending HoBBE admin approval.`};
      }
      const res = await axios.post(
        `${this.CHAPA_BASE_URL}/refund/${exRef}`,
        {
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );


      await this.paymentRepository.changePaymentStatus(payment.id.toString(),'Refund In Progress');
      await this.refundRepository.save({
        payment_id: payment.id.toString(),
        event_id: payment.event_id.toString(),
        reason: reason,
      });
      
     await this.insertRefundTransaction(
        payment.id.toString() as `${string}-${string}-${string}-${string}-${string}`,
        exRef,
        userId,
        payment.user_id.toString() as `${string}-${string}-${string}-${string}-${string}`,
      );

      // return res.data with success message;
      return {details: res.data};
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || { message: error.message },
        error.response?.status || 500,
      );
    }
  }

  async manualRefundPayment(exRef: string, userId:string,reason?: string,): Promise<any> {
    try {
      //  check if txRef exists
      const payment = await this.paymentRepository.findByExRef(exRef);

      const refundCheck = await this.kafkaRefundRpcService.sendRequest(
        'refund-request-topic',
        { 
          bookingId: payment.booking_id, 
          eventId: payment.event_id,
          refundType:'manual'
         },
      );

  
      const res = await axios.post(
        `${this.CHAPA_BASE_URL}/refund/${exRef}`,
        {
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );


      await this.paymentRepository.changePaymentStatus(payment.id.toString(),'Refund In Progress');
      await this.refundRepository.save({
        payment_id: payment.id.toString(),
        event_id: payment.event_id.toString(),
        reason: reason,
      });
      
     await this.insertManualRefundTransaction(
        payment.id.toString() as `${string}-${string}-${string}-${string}-${string}`,
        exRef,
        userId,
        payment.user_id.toString() as `${string}-${string}-${string}-${string}-${string}`,
      );

      // return res.data with success message;
      return {details: res.data};
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || { message: error.message },
        error.response?.status || 500,
      );
    }
  }





  async getRefundRequests(){
    try {
      const requests = await this.refundRequestRepository.find({where:{status:RefundStatus.PENDING}});
      return requests;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch refund requests');
    }
  }

  async getRefundRequestById(refundId:string){
    try {
      const refund = await this.refundRequestRepository.findOne({where:{id:refundId}});
      if(!refund){
        throw new NotFoundException(`Refund with ID ${refundId} not found`);
      }
      return refund;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch refund by ID');
    }
  }

  async getRefundRequestsByDate(
    from: string,
    to: string,
  ) {
    try {
      const res = await this.refundRequestRepository.createQueryBuilder('refund_request')
        .where('refund_request.requested_at BETWEEN :from AND :to', { from, to })
        // .andWhere('refund_request.status = :status', { status: RefundStatus.PENDING })
        .getMany();
      return res;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch refund requests by date');
    }
  }


  async refundCanceledEventPayments(
    dto:ChapaCancelEventRefundDto,
    user:string,
  ){
    try {
      const payments = await this.paymentRepository.findByEventIdToCancelEvent(dto.event_id);
      // return payments;
      // loop through payments and call refundPayment for each
      for(const payment of payments){
        await this.refundPayment(payment.external_reference,user,'Event Canceled: '+ (dto.reason ?? 'No reason provided'));
      }

      return {message: `Refund initiated for ${payments.length} payments associated with event ${dto.event_id}`};
    }
    catch (error: any) {
      throw new HttpException(
        error.response?.data || { message: error.message },
        error.response?.status || 500,
      );
    } 
  }



  async insertRefundTransaction(
    paymentId: UUID, 
    externalRefNo: string, 
    username: string, 
    userId: UUID) {

   const result = await this.connection.query(
       `SELECT fn_auto_refund($1::uuid, $2::varchar, $3::varchar, $4::uuid) as message`,
        [paymentId, externalRefNo,username, userId.toString()]
      );

    return result[0].message;
  }

  async insertManualRefundTransaction(
    paymentId: UUID, 
    externalRefNo: string, 
    username: string, 
    userId: UUID) {

   const result = await this.connection.query(
       `SELECT fn_manual_refund($1::uuid, $2::varchar, $3::varchar, $4::uuid) as message`,
        [paymentId, externalRefNo,username, userId.toString()]
      );

    return result[0].message;
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
      throw new InternalServerErrorException(
        'Failed to generate transaction reference',
      );
    }
  }


  async approveRefundRequest(refundRequestId: string, approverId: string): Promise<any> {
    try {
      const refundRequest = await this.refundRequestRepository.findOne({ where: { id: refundRequestId } });
      if (!refundRequest) {
        throw new NotFoundException(`Refund request with ID ${refundRequestId} not found`); 
      }

      if (refundRequest.status !== RefundStatus.PENDING) {
        throw new BadRequestException(`Refund request with ID ${refundRequestId} is not in a pending state`);
      }

    

      // refund the payment via Chapa
      const refundResponse = await this.manualRefundPayment(
        refundRequest.payment_gateway_ref,
        refundRequest.userid,
        refundRequest.reason,
      );

      console.log(refundResponse);
            
      refundRequest.status = RefundStatus.APPROVED;
      refundRequest.approval_level = 1;
      refundRequest.approved_by = approverId;
      refundRequest.approved_at = new Date();

      await this.refundRequestRepository.save(refundRequest);
      return { message: `Refund request ${refundRequestId} approved successfully` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to approve refund request');
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

private async emitPaymentSuccessfulEvent(paymentDetails: any) {
    try {
      const eventPayload = {
        userId: paymentDetails.user_id.toString(),
        transactionId: paymentDetails.id.toString(),
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
      };
      await this.kafkaProducerService.produce({
        topic: 'payment_successful',
        messages: [{ value: JSON.stringify(eventPayload) }],
      });
      this.logger.log(`Emitted 'payment_successful' event for user ${eventPayload.userId}`);
    } catch (error) {
      this.logger.error(`Failed to emit Kafka event for successful payment ${paymentDetails.id}`, error.stack);
    }
  }

  private async emitPaymentFailedEvent(paymentDetails: any, reason: string) {
    try {
      const eventPayload = {
        userId: paymentDetails.user_id.toString(),
        transactionId: paymentDetails.id.toString(),
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        reason: reason,
      };
      await this.kafkaProducerService.produce({
        topic: 'payment_failed',
        messages: [{ value: JSON.stringify(eventPayload) }],
      });
      this.logger.log(`Emitted 'payment_failed' event for user ${eventPayload.userId}`);
    } catch (error) {
      this.logger.error(`Failed to emit Kafka event for failed payment ${paymentDetails.id}`, error.stack);
    }
  }

}
