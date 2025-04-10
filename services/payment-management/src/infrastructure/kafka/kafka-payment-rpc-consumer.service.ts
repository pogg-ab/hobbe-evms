// rpc-consumer.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { ChapaSDKService } from 'src/application/services/payment-methods/chapa/chapa-sdk.service';

@Injectable()
export class KafkaPaymentRpcConsumerService implements OnModuleInit {
  private kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER] });
  private consumer = this.kafka.consumer({ groupId: 'payment-link-rpc-server-group' });
  private producer = this.kafka.producer();


  constructor(
    private readonly chapaSdkService: ChapaSDKService,
  ) { }

  async onModuleInit() {
    await this.consumer.connect();
    await this.producer.connect();
    await this.consumer.subscribe({ topic: 'payment-link-request-topic', fromBeginning: false });

    this.consumer.run({
      eachMessage: async ({ message }) => {
        const key = message.key?.toString();
        const replyTopic = message.headers?.replyTopic?.toString();

        try {
          const value = JSON.parse(message.value!.toString());
          // console.log('Received RPC message:', value);

          if (!value) return;

          const { event_id, booking_id, amount, user_id } = JSON.parse(value.value);
          const paymentLink = await this.chapaSdkService.paymentInit({
            event_id,
            booking_id,
            user_id,
            amount,
            currency: 'ETB',
            phone_number: '0900123456',
          });

          const response = {
            success: true,
            data: paymentLink,
          };

          await this.producer.send({
            topic: replyTopic!,
            messages: [
              {
                key,
                value: JSON.stringify(response),
              },
            ],
          });

        } catch (err: any) {
          // console.error('❌ Error processing message:', err?.message || err);

          // Optional: send an error response back to replyTopic
          if (replyTopic) {
            const errorResponse = {
              success: false,
              error: err?.message || 'Unknown error',
            };

            await this.producer.send({
              topic: replyTopic,
              messages: [
                {
                  key,
                  value: JSON.stringify(errorResponse),
                },
              ],
            });
          }
        }
      },
    });

  }
}
