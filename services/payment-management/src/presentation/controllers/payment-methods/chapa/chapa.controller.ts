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
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateChapaPayDto } from 'src/presentation/dtos/chapa/create-chapa-pay.dto';
import { ChapaSDKService } from 'src/application/services/payment-methods/chapa/chapa-sdk.service';
import { AuditLogInterceptor } from 'src/presentation/interceptors/audit-log.interceptor';
import { CreateChapaPayoutDto } from 'src/presentation/dtos/chapa/create-chapa-payout.dto';
import { ChapaPayoutDto } from 'src/presentation/dtos/chapa/chapa-payout.dto';

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
  async initializePayout(@Body() chapaPayoutDto: ChapaPayoutDto): Promise<any> {
    return await this.chapaSdkService.payoutInit(chapaPayoutDto);
  }

  @ApiOperation({ description: 'Verify Payout' })
  @HttpCode(200)
  @ApiResponse({
    description: 'Verifies the payout status',
    type: Object, // You can define a specific response DTO for payout status if needed
  })
  @Get('verify-payout/:reference')
  async verifyPayout(@Param('reference') reference: string) {
    return await this.chapaSdkService.verifyPayout(reference);
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
