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
