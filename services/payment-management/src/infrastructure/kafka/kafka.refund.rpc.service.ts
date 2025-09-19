
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class KafkaRefundRpcService implements OnModuleInit {
  private kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER] });
  private producer: Producer = this.kafka.producer();
  private consumer: Consumer = this.kafka.consumer({ groupId: 'refund-rpc-server-group' });
  private readonly replyTopic = 'refund-reply-topic';
  private responseMap = new Map<string, (data: any) => void>();

  async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();

    await this.consumer.subscribe({ topic: this.replyTopic, fromBeginning: false });

    this.consumer.run({
      eachMessage: async ({ message }) => {
        const correlationId = message.key?.toString();
        const value = message.value?.toString();
        const resolver = this.responseMap.get(correlationId);
        if (resolver) {
          resolver(JSON.parse(value));
          this.responseMap.delete(correlationId);
        }
      },
    });
  }

  async sendRequest(topic: string, payload: any): Promise<any> {
    const correlationId = uuidv4();

    await this.producer.send({
      topic,
      messages: [
        {
          key: correlationId,
          value: JSON.stringify(payload),
          headers: {
            replyTopic: this.replyTopic,
          },
        },
      ],
    });

    return new Promise((resolve) => {
      this.responseMap.set(correlationId, resolve);
    });
  }
}
