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
import { StripeService } from 'src/application/services/payment-methods/stripe/stripe.service';
import { CreateStripePayDto } from 'src/presentation/dtos/stripe/create-stripe-pay.dto';


@Controller('stripe')
@ApiTags('Stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
  ) {}

  @ApiBody({ type: CreateStripePayDto })
  @ApiOperation({ description: 'Initialize  Payment' })
  @HttpCode(200)
  
  @Post('initialize')
  async initializePayment(@Body() stripePayDto:CreateStripePayDto):Promise<any>{
    return  await this.stripeService.createCheckoutSession(stripePayDto);
  }

  @Get('verify/:sessionId')
  async verifyPayment(@Param('sessionId') sessionId: string,@Res() res: any) {
    await this.stripeService.verifyPayment(sessionId);
    return res.redirect('hobbeems://payment_success');
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
