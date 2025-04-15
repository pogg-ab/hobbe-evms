// stripe.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from 'src/application/services/payment-methods/stripe/stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  async createCheckout(@Body() body: { name: string; price: number; quantity: number }) {
    const session = await this.stripeService.createCheckoutSession(body);
    return { url: session.url };
  }
}
