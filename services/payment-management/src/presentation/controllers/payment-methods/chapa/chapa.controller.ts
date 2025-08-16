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
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateChapaPayDto } from 'src/presentation/dtos/chapa/create-chapa-pay.dto';
import { ChapaSDKService } from 'src/application/services/payment-methods/chapa/chapa-sdk.service';

@Controller('chapa')
@ApiTags('Chapa')
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
