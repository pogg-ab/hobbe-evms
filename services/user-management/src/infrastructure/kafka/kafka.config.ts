import { KafkaOptions, Transport } from '@nestjs/microservices';
import { ConsumerConfig, KafkaConfig } from 'kafkajs';

export const kafkaConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'auth-consumer',
      brokers: [process.env.KAFKA_BROKER],
    } as KafkaConfig,
    consumer: {
      groupId: 'auth-consumer-group',
    } as ConsumerConfig,
  },
};
