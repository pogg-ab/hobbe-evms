import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Chapa } from 'chapa-nodejs';
import { ConfigService } from '@nestjs/config';
import { CreateChapaPayDto } from 'src/presentation/dtos/chapa/create-chapa-pay.dto';
import { 
  CreateChapaPayoutDto, 
  ChapaPayoutResponseDto,
  PayoutStatusResponseDto,
  PayoutMethod,
  Currency
} from 'src/presentation/dtos/chapa/create-chapa-payout.dto';
import axios, { AxiosError } from 'axios';
import { CREATE_PAYMENT_TOKEN } from 'src/domain/repositories/payments/payments.repository.token';
import { IPaymentsRepository } from 'src/domain/repositories/payments/payments.repository';
import { Connection } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';
import { validate as uuidValidate } from 'uuid';
import { UUID } from 'crypto';

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

  /**
   * Create a new payout with retry logic
   * @param payoutDto Payout details
   * @param maxRetries Maximum number of retry attempts (default: 3)
   * @param initialDelayMs Initial delay between retries in milliseconds (default: 1000ms)
   * @returns Payout response with transaction details
   */
  async createPayout(
    payoutDto: CreateChapaPayoutDto,
    maxRetries: number = 3,
    initialDelayMs: number = 1000
  ): Promise<ChapaPayoutResponseDto> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Validate payout method specific requirements
        this.validatePayoutMethod(payoutDto.method, payoutDto.beneficiary);

        // Balance check has been removed as per requirements
        // The transaction will be attempted regardless of balance

        const payload = this.buildPayoutPayload(payoutDto);
        
        // Log the complete payload being sent to Chapa API (masking sensitive data)
        const loggablePayload = { 
          ...payload,
          account_number: payload.account_number ? this.maskSensitiveData(payload.account_number) : undefined,
          // Don't log the full account number for security
        };
        
        this.logger.log(`[Attempt ${attempt}/${maxRetries}] Sending payout request to Chapa API`, {
          endpoint: this.TRANSFER_ENDPOINT,
          method: 'POST',
          headers: this.getAuthHeaders(),
          payload: loggablePayload
        });
        
        const response = await axios.post(
          this.TRANSFER_ENDPOINT,
          payload,
          {
            headers: this.getAuthHeaders(),
            timeout: 30000, // 30 seconds timeout
          }
        );

        this.logger.log(`Payout initiated successfully for reference: ${payoutDto.reference}`);
        return response.data;
        
      } catch (error) {
        lastError = error;
        
        if (axios.isAxiosError(error) && error.response) {
          const status = error.response.status;
          const errorData = error.response.data;
          
          // Log the complete error response for debugging
          this.logger.error('Chapa API Error:', {
            status,
            statusText: error.response.statusText,
            data: errorData,
            headers: error.response.headers
          });
          
          // Handle insufficient balance error specifically
          if (status === 400 && errorData?.message === 'Insufficient Balance') {
            this.logger.error('Insufficient balance in Chapa account to process payout');
            throw new BadRequestException('Insufficient balance in Chapa account to process this payout');
          }
          
          // For other 4xx errors, include the error details from the API
          if (status >= 400 && status < 500 && status !== 429) {
            const errorDetails = errorData?.message || JSON.stringify(errorData);
            const errorMessage = `Chapa API Error (${status}): ${errorDetails}`;
            this.logger.error(errorMessage);
            throw new BadRequestException(errorMessage);
          }
        }
        
        // Calculate delay with exponential backoff
        const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
        
        if (attempt < maxRetries) {
          this.logger.warn(
            `Attempt ${attempt} failed, retrying in ${delayMs}ms: ${error.message}`
          );
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    // If we get here, all retries have failed
    const errorMessage = this.handlePayoutError(
      lastError,
      'All retry attempts failed for payout'
    );
    this.logger.error(errorMessage, lastError?.stack);
    throw new BadRequestException(errorMessage);
  }

  /**
   * Get payout status by reference
   * @param reference Payout reference ID
   * @returns Payout status details
   */
  async getPayoutStatus(reference: string): Promise<PayoutStatusResponseDto> {
    try {
      this.logger.log(`Fetching status for payout: ${reference}`);
      
      const response = await axios.get(
        `${this.TRANSFER_ENDPOINT}/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      const errorMessage = this.handlePayoutError(error, 'Failed to fetch payout status');
      this.logger.error(errorMessage, error.stack);
      throw new BadRequestException(errorMessage);
    }
  }

  /**
   * List all payouts with optional filtering
   * @param page Page number (starts from 1)
   * @param itemsPerPage Number of items per page (max 100)
   * @param status Filter by status (optional)
   * @returns List of payouts with pagination info
   */
  async listPayouts(
    page: number = 1,
    itemsPerPage: number = 50,
    status?: string
  ): Promise<{ data: any[]; meta: any }> {
    try {
      const params = new URLSearchParams({
        page: Math.max(1, page).toString(),
        perPage: Math.min(100, Math.max(1, itemsPerPage)).toString(),
        ...(status && { status }),
      });

      const response = await axios.get(
        `${this.TRANSFER_ENDPOINT}?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      const errorMessage = this.handlePayoutError(error, 'Failed to list payouts');
      this.logger.error(errorMessage, error.stack);
      throw new BadRequestException(errorMessage);
    }
  }

  /**
   * Handle payout webhook events
   * @param payload Webhook payload
   * @param signature Webhook signature for verification
   * @returns Processed webhook data
   */
  async handlePayoutWebhook(payload: any, signature: string): Promise<any> {
    try {
      this.logger.log('Processing Chapa payout webhook');
      
      // Verify webhook signature (implement your verification logic)
      const isVerified = await this.verifyWebhookSignature(payload, signature);
      
      if (!isVerified) {
        throw new Error('Invalid webhook signature');
      }

      const { event, data } = payload;
      
      // Handle different webhook events
      switch (event) {
        case 'transfer.completed':
          await this.handleCompletedPayout(data);
          break;
          
        case 'transfer.failed':
          await this.handleFailedPayout(data);
          break;
          
        default:
          this.logger.warn(`Unhandled webhook event: ${event}`);
      }

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error('Error processing payout webhook', error.stack);
      throw new InternalServerErrorException('Failed to process webhook');
    }
  }

  //#region Private Helper Methods

  private  /**
   * Validates the payout method and its required fields
   * @param method The payout method (e.g., 'bank', 'mobile_money')
   * @param beneficiary The beneficiary details
   * @throws BadRequestException if validation fails
   */
  private validatePayoutMethod(method: string, beneficiary: any): void {
    if (!method) {
      throw new BadRequestException('Payout method is required');
    }

    if (!beneficiary) {
      throw new BadRequestException('Beneficiary details are required');
    }

    const normalizedMethod = method.toLowerCase();
    
    // Handle both 'bank' and 'bank_account' as valid methods
    if (normalizedMethod === 'bank' || normalizedMethod === 'bank_account') {
      this.validateBankPayout(beneficiary);
    } 
    else if (normalizedMethod === 'mobile_money') {
      this.validateMobileMoneyPayout(beneficiary);
    }
    else {
      throw new BadRequestException(`Unsupported payout method: ${method}. Supported methods are: bank, bank_account, mobile_money`);
    }
  }

  /**
   * Validates bank transfer payout details
   * @param beneficiary The beneficiary details
   * @throws BadRequestException if validation fails
   */
  private validateBankPayout(beneficiary: any): void {
    const requiredFields = [
      'account_number',
      'account_name',
      'bank_code'
    ];

    this.validateRequiredFields(beneficiary, requiredFields, 'bank transfer');
  }

  /**
   * Validates mobile money payout details
   * @param beneficiary The beneficiary details
   * @throws BadRequestException if validation fails
   */
  private validateMobileMoneyPayout(beneficiary: any): void {
    const requiredFields = [
      'account_number',
      'account_name',
      'mobile_money_provider'
    ];

    this.validateRequiredFields(beneficiary, requiredFields, 'mobile money');
  }

  /**
   * Validates that all required fields are present in the beneficiary object
   * @param beneficiary The beneficiary details
   * @param requiredFields Array of required field names
   * @param methodName Name of the payment method for error messages
   * @throws BadRequestException if any required field is missing
   */
  private validateRequiredFields(beneficiary: any, requiredFields: string[], methodName: string): void {
    const missingFields = requiredFields.filter(field => !beneficiary[field]);
    
    if (missingFields.length > 0) {
      throw new BadRequestException(
        `The following fields are required for ${methodName} payouts: ${missingFields.join(', ')}`
      );
    }
  }

  private validateBeneficiaryDetails(payoutDto: CreateChapaPayoutDto): void {
    const { method, beneficiary } = payoutDto;
    
    if (method === PayoutMethod.BANK_ACCOUNT && !beneficiary.bank_code) {
      throw new BadRequestException('Bank code is required for bank transfers');
    }
    
    if (method === PayoutMethod.MOBILE_MONEY && !beneficiary.mobile_money_provider) {
      throw new BadRequestException('Mobile money provider is required for mobile money transfers');
    }
  }

  private buildPayoutPayload(payoutDto: CreateChapaPayoutDto): any {
    const { amount, currency, reference, description, method, beneficiary, callback_url } = payoutDto;
    
    // Ensure required fields are present
    if (!beneficiary?.account_number) {
      throw new BadRequestException('Account number is required for the beneficiary');
    }
    
    if (method === PayoutMethod.BANK_ACCOUNT && !beneficiary.bank_code) {
      throw new BadRequestException('Bank code is required for bank transfers');
    }
    
    if (method === PayoutMethod.MOBILE_MONEY && !beneficiary.mobile_money_provider) {
      throw new BadRequestException('Mobile money provider is required for mobile money transfers');
    }
    
    // Convert amount to a number and ensure it's in the correct format
    const amountValue = Number(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      throw new BadRequestException('Invalid amount specified');
    }

    // Log the amount being sent for debugging
    this.logger.log(`Preparing payout with amount: ${amountValue} ${currency}`);

    // Construct the payload according to Chapa's API requirements
    const basePayload: any = {
      account_name: beneficiary.account_name,
      account_number: beneficiary.account_number,
      amount: amountValue.toString(),
      currency: currency || 'ETB', // Default to ETB if not specified
      reference,
      ...(description && { narration: description }),
    };

    // Add bank code or mobile money provider based on the method
    if (method === PayoutMethod.BANK_ACCOUNT) {
      basePayload.bank_code = beneficiary.bank_code;
    } else if (method === PayoutMethod.MOBILE_MONEY) {
      basePayload.mobile_money_provider = beneficiary.mobile_money_provider;
    }

    // Add callback URL if provided
    if (callback_url) {
      basePayload.callback_url = callback_url;
    }

    return basePayload;
  }

  private async handleCompletedPayout(data: any): Promise<void> {
    this.logger.log(`Payout completed: ${data.reference}`);
    // Implement your business logic for completed payouts
    // e.g., update database, send notifications, etc.
  }

  private async handleFailedPayout(data: any): Promise<void> {
    this.logger.warn(`Payout failed: ${data.reference} - ${data.failure_reason || 'Unknown error'}`);
    // Implement your business logic for failed payouts
    // e.g., update database, send notifications, retry logic, etc.
  }

  /**
   * Verify the webhook signature using HMAC-SHA256
   * @param payload The raw request body
   * @param signature The signature from the 'Chapa-Signature' header
   * @returns boolean True if the signature is valid
   */
  private async verifyWebhookSignature(payload: any, signature: string): Promise<boolean> {
    try {
      if (!signature) {
        this.logger.warn('No signature provided in webhook request');
        return false;
      }

      const webhookSecret = this.configService.get<string>('CHAPA_WEBHOOK_SECRET');
      if (!webhookSecret) {
        this.logger.error('CHAPA_WEBHOOK_SECRET is not configured');
        return false;
      }
      
      // Ensure we have a string payload
      const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
      
      // Create HMAC signature
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', webhookSecret);
      const computedSignature = `sha256=${hmac.update(payloadString).digest('hex')}`;
      
      // Compare signatures in constant time to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(computedSignature)
      );
    } catch (error) {
      this.logger.error('Error verifying webhook signature', error);
      return false;
    }
  }

  private handlePayoutError(error: unknown, defaultMessage: string): string {
    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const { status, data } = axiosError.response;
        this.logger.error(`Chapa API Error: ${status} - ${JSON.stringify(data)}`);
        return (data as any)?.message || `Chapa API error: ${status} ${axiosError.message}`;
      }
    }
    
    // Handle other errors
    return error instanceof Error ? error.message : defaultMessage;
  }



  /**
   * Get authentication headers for API requests
   */
  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.API_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Mask sensitive data for logging
   * @param data The data to mask
   * @returns Masked string
   */
  private maskSensitiveData(data: string): string {
    if (!data || data.length <= 4) return '***';
    return `${data.substring(0, 2)}***${data.substring(data.length - 2)}`;
  }

  //#endregion

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
