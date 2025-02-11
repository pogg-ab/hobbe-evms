import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Param,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChapaService } from 'src/application/services/payment-methods/chapa/chapa.service';
import { CreateChapaPayDto } from 'src/presentation/dtos/chapa/create-chapa-pay.dto';
import * as crypto from 'crypto';

@Controller('chapa')
@ApiTags('Chapa')
export class ChapaController {
  private readonly logger = new Logger(ChapaController.name);
  constructor(private readonly chapaService: ChapaService) {}

  @ApiBody({ type: CreateChapaPayDto })
  @ApiOperation({ description: 'Initialize Payment' })
  @HttpCode(200)
  @ApiResponse({
    description: 'Returns the checkout URL to complete the payment',
    type: Object, // You can define a specific response DTO if needed
  })
  @Post('pay')
  async pay(@Body() data: CreateChapaPayDto) {
    try {
      const result = await this.chapaService.initializePayment(data);
      return { checkoutUrl: result.data.checkout_url }; // Send only the checkout URL back
    } catch (error) {
      throw new HttpException(
        'Failed to initialize payment: ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @ApiOperation({ description: 'Verify Payment' })
  @HttpCode(200)
  @ApiResponse({
    description: 'Verifies the payment status',
    type: Object, // You can define a specific response DTO for payment status if needed
  })
  @Get('verify/:txRef')
  async verify(@Param('txRef') txRef: string) {
    try {
      const result = await this.chapaService.verifyPayment(txRef);
      return result;
    } catch (error) {
      throw new HttpException(
        'Payment verification failed: ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('webhook')
  async webhook(@Body() body: any, @Headers() headers: any) {
 
    this.logger.log('Received webhook from Chapa');

    const chapaSignature = headers['x-chapa-signature'];
    this.logger.log('Received Signature:', chapaSignature);

    const secret = process.env.CHAPA_WEBHOOK_SECRET;
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    this.logger.log('Computed Signature:', computedSignature);

    if (!chapaSignature || chapaSignature !== computedSignature) {
      this.logger.warn('Unauthorized webhook attempt');
      return { message: 'Unauthorized' };
    }    
    return this.chapaService.handleWebhook(body);
  }
}
