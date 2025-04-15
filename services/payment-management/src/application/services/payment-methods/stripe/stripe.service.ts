// stripe.service.ts
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
    //   apiVersion: '2022-11-15',
    });
  }

  async createCheckoutSession(product: { name: string; price: number; quantity: number }) {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
            },
            unit_amount: product.price * 100, // convert to cents
          },
          quantity: product.quantity,
        },
      ],
      success_url: 'http://localhost:4002/success',
      cancel_url: 'http://localhost:4002/cancel',
    });
  }
}
