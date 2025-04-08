import { KafkaOptions, Transport } from '@nestjs/microservices';
import { ConsumerConfig, KafkaConfig } from 'kafkajs';

export const kafkaConsumerConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'user-validation-consumer',
      brokers: [process.env.KAFKA_BROKER],
    } as KafkaConfig,
    consumer: {
      groupId: 'message-consumer-group',
    } as ConsumerConfig,
  },
};
