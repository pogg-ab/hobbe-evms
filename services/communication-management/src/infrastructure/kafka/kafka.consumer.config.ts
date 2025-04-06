import { KafkaOptions, Transport } from '@nestjs/microservices';
import { ConsumerConfig, KafkaConfig } from 'kafkajs';

export const kafkaConsumerConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'comunication-user-validation-consumer',
      brokers: [process.env.KAFKA_BROKER],
    } as KafkaConfig,
    consumer: {
      groupId: 'comunication-message-consumer-group',
    } as ConsumerConfig,
  },
};
