import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpException,
  HttpStatus,
  Res,
  UseInterceptors,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateChapaPayDto } from 'src/presentation/dtos/chapa/create-chapa-pay.dto';
import { ChapaSDKService } from 'src/application/services/payment-methods/chapa/chapa-sdk.service';
import { AuditLogInterceptor } from 'src/presentation/interceptors/audit-log.interceptor';
import { ChapaPayoutDto } from 'src/presentation/dtos/chapa/chapa-payout.dto';
import { GetTransactionDto } from 'src/presentation/dtos/chapa/get-transactions.dto';
import { GetTransferDto } from 'src/presentation/dtos/chapa/get-transfers.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { ChapaRefundDto } from 'src/presentation/dtos/chapa/chapa-refund.dto';
import { ChapaCancelEventRefundDto } from 'src/presentation/dtos/chapa/chapa-cancel-event.refund.dto';
import { ChapaGetRefundByDateRangeDto } from 'src/presentation/dtos/chapa/chapa-get-refund-by-date-range.dto';
import { Response } from 'express';
import { AuditLog } from '../../../decorators/audit-log.decorator';
import { ActionType } from '../../../../domain/entities/audit-log.entity';

@Controller('chapa')
@ApiTags('Chapa')
@UseInterceptors(AuditLogInterceptor)
export class ChapaController {
  constructor(
    private readonly chapaSdkService: ChapaSDKService,
  ) {}

  @ApiBody({ type: CreateChapaPayDto })
  @ApiOperation({ description: 'Initialize  Payment' })
  @HttpCode(200)
  
  @Post('initialize')
  @AuditLog({ actionType: ActionType.CREATE_PAYMENT_INTENT, targetEntity: 'Payment' })
  async initializePayment(@Body() chapaPayDto:CreateChapaPayDto):Promise<any>{
    return  await this.chapaSdkService.paymentInit(chapaPayDto);
  }

  @ApiOperation({ description: 'Verify Payment' })
  @HttpCode(200)
  @ApiResponse({
    description: 'Verifies the payment status',
    type: Object, // You can define a specific response DTO for payment status if needed
  })
  @Get('verify/:txRef')
  @AuditLog({ actionType: ActionType.CONFIRM_PAYMENT, targetEntity: 'Payment' })
  async verify(@Param('txRef') txRef: string,@Res() res: any) {
    try {
      const result = await this.chapaSdkService.verifyPayment(txRef);
      // return result;\\
      return res.redirect('hobbeems://payment_success');
    } catch (error) {
      throw new HttpException(
        'Payment verification failed: ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // chapa payout

  @ApiOperation({ description: 'Initialize Payout' })
  @HttpCode(200)
  @ApiResponse({
    description: 'Initializes the payout process',
    type: Object,
  })
  @Post('payout')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async initializePayout(
    @Body() chapaPayoutDto: ChapaPayoutDto,
    @CurrentUserId() user: any,
  ): Promise<any> {
    return await this.chapaSdkService.payoutInit(chapaPayoutDto,user.userId);
  }

  @ApiOperation({ description: 'Verify Payout' })
  @HttpCode(200)
  @ApiResponse({
    description: 'Verifies the payout status',
    type: Object, // You can define a specific response DTO for payout status if needed
  })
  @Get('verify-payout/:reference')
  async verifyPayout(@Param('reference') reference: string) {
    const payout = await this.chapaSdkService.verifyPayout(reference);

    // if (payout.data.status === 'success') {
    //   // we gonna call here payout transaction function
    //   return {message:"Payout successful",payout};
      
    // }
    return {message:"Payout waiting for confirmation from HoBBE Admin",payout};
  }


  @ApiOperation({ description: 'Get Transactions' })
  @HttpCode(200)
  @ApiResponse({
    description: 'Returns transactions with optional filters',
    type: Array, 
  })
  @Get('transactions')
  @AuditLog({ actionType: ActionType.VIEW_TRANSACTION_HISTORY, targetEntity: 'Transaction' }) 
  async getTransactions(@Query() getTransactionDto: GetTransactionDto) {
    return await this.chapaSdkService.getTransactions(
      getTransactionDto.from,
      getTransactionDto.to,
      getTransactionDto.page,
      getTransactionDto.per_page,
    );
  }
  


  @ApiOperation({ description: 'Get Transfers' })
  @HttpCode(200)
  @ApiResponse({
    description: 'Returns an array of transfers',
    type: GetTransferDto,
  })
  @Get('transfers')
  async getTransfers(
   @Param() getTransferDto: GetTransferDto
  ) {
    return await this.chapaSdkService.getTransfers(
      getTransferDto.from,
      getTransferDto.to,
      getTransferDto.page,
      getTransferDto.per_page,
    );
  }

  // lets do refund

  @Post('refund')
   @AuditLog({ actionType: ActionType.PROCESS_REFUND, targetEntity: 'Refund' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Initiate a refund via Chapa API' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async refund(
    @Body() dto: ChapaRefundDto,
    @CurrentUserId() user: any,
  ) {    
    return this.chapaSdkService.refundPayment(
      dto.txRef,
      user.userId,
      dto.reason,
    )
  }


  @Post('refund/cancel-event')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Initiate a refund via Chapa API' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async refundCancelEvent(
    @Body() dto: ChapaCancelEventRefundDto,
    @CurrentUserId() user: any,
  ) {    
    return await this.chapaSdkService.refundCanceledEventPayments(
      dto,
      user.username,
      
    )
  }


  //  approve refund request
  @Post('refund/approve/:refundRequestId')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Approve a refund request' })
  @ApiResponse({ status: 200, description: 'Refund request approved successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async approveRefundRequest( 
    @Param('refundRequestId') refundRequestId: string,
    @CurrentUserId() user: any,
  ) {
    return await this.chapaSdkService.approveRefundRequest(
      refundRequestId,
      user.userId,
    );
  }

  // get refund by id
  @ApiOperation({ description: 'Get Refund by ID' })
  @HttpCode(200)
  @ApiResponse({
    description: 'Returns a refund details by ID',
    type: Object,
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)

  @Get('refund/:refundId')
  async getRefundRequestById(@Param('refundId') refundId: string) {
    return await this.chapaSdkService.getRefundRequestById(refundId);
  }


  // get refund requests 
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ description: 'Get Refund Requests' })
  @HttpCode(200)
  @ApiResponse({
    description: 'Returns an array of refund requests',
    type: Array,
  })
  @Get('refund-requests')
  async getRefundRequests() {
    return await this.chapaSdkService.getRefundRequests();
  }

  // get refund requests by date range
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  @Post('refund-requests-by-date')
  @ApiOperation({ description: 'Get Refund Requests by Date Range' })
  @ApiResponse({
    description: 'Returns an array of refund requests within the specified date range',
    type: Array,
  })
  async getRefundRequestsByDate(@Body() dto: ChapaGetRefundByDateRangeDto) {
    return await this.chapaSdkService.getRefundRequestsByDate(dto.from, dto.to);
  }



  @ApiOperation({ description: 'Get Supported Banks' })
  @HttpCode(200)
  @ApiResponse({
    description: 'Returns an array of supported banks',
    type: Array,
  })
  @Get('banks')
  async getBanks() {
    return await this.chapaSdkService.getSupportedBanks();
  }





  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any, @Res() res: Response) {
   try {
    // console.log('Webhook payload:', body);

    const { status, tx_ref, amount, event } = body;

    if (status === 'success' || event === 'payment.success') {
      console.log(`Payment success for tx_ref: ${tx_ref}, amount: ${amount}`);
    } else if (status === 'failed' || event === 'payment.failed') {
      console.log(`Payment failed for tx_ref: ${tx_ref}`);
    } else if (event === 'charge.refunded' && status === 'refunded') {
      console.log(`Refund settled for tx_ref: ${tx_ref} '---' ${body}`);
    }

    return res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook failed' });
  }
  }























  // @Post('webhook')
  // async webhook(@Body() body: any, @Headers() headers: any) {
 
  //   this.logger.log('Received webhook from Chapa');

  //   const chapaSignature = headers['x-chapa-signature'];
  //   this.logger.log('Received Signature:', chapaSignature);

  //   const secret = process.env.CHAPA_WEBHOOK_SECRET;
  //   const computedSignature = crypto
  //     .createHmac('sha256', secret)
  //     .update(JSON.stringify(body))
  //     .digest('hex');

  //   this.logger.log('Computed Signature:', computedSignature);

  //   if (!chapaSignature || chapaSignature !== computedSignature) {
  //     this.logger.warn('Unauthorized webhook attempt');
  //     return { message: 'Unauthorized' };
  //   }    
  //   return this.chapaService.handleWebhook(body);
  // }

}
