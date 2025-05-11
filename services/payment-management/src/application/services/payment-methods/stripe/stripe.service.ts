// stripe.service.ts
import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { CreateStripePayDto } from 'src/presentation/dtos/stripe/create-stripe-pay.dto';
import { CREATE_PAYMENT_TOKEN } from 'src/domain/repositories/payments/payments.repository.token';
import { IPaymentsRepository } from 'src/domain/repositories/payments/payments.repository';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly CALLBACK_BASE_URL: string;
  constructor(
    @Inject(CREATE_PAYMENT_TOKEN)
    private readonly paymentRepository: IPaymentsRepository,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      {
        //   apiVersion: '2022-11-15',
      },
    );
    const callback_baseurl =
      this.configService.get<string>('CALLBACK_BASE_URL');
    if (!callback_baseurl) {
      throw new Error(
        'CALLBACK_BASE_URL is not defined in the environment variables',
      );
    }
    this.CALLBACK_BASE_URL = callback_baseurl;
  }

  async createCheckoutSession(dto: CreateStripePayDto): Promise<any> {
    try {
      const response = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: dto.currency,
              product_data: {
                name: dto.booking_id,
                description: dto.event_id,
              },
              unit_amount: parseFloat(dto.amount) * 100, // convert to cents
            },
            quantity: 1,
          },
        ],
        success_url: `${this.CALLBACK_BASE_URL}/stripe/verify/{CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.CALLBACK_BASE_URL}/stripe/cancel/{CHECKOUT_SESSION_ID}`,
      });

      const paymentDto = {
        ...dto,
        // user_id:"849b4dda-fc2b-452d-bc12-e8dd0bc8b6f3",
        tx_ref: response.id,
        payment_method: 'Stripe',
      };
      await this.paymentRepository.create(paymentDto);

      return {
        message: 'Hosted Link',
        status: 'success',
        data: {
          checkout_url: response.url,
          payment_status: response.payment_status,
        },
      };
    } catch (error) {
      return new Error('Payment initialization failed: ' + error.message);
    }
  }

  async verifyPayment(sessionId: string): Promise<any> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        const paymentIntentId = session.payment_intent as string;
        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
        const latestChargeId = paymentIntent.latest_charge as string;
        const charge = await this.stripe.charges.retrieve(latestChargeId, {
          expand: ['balance_transaction'],
        });
        const fee = charge.balance_transaction['fee_details'][0]['amount'];
        const chargeAmount = fee / 100; // convert to dollars
        return await this.paymentRepository.verifyChapaPayment("Stripe",session.id, chargeAmount.toString())
      } else {
        return { status: 'failed', session };
      }
    } catch (error) {
      return new Error('Payment verification failed: ' + error.message);
    }
  }
}
