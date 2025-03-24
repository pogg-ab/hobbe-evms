import { KafkaOptions, Transport } from '@nestjs/microservices';
import { ConsumerConfig, KafkaConfig } from 'kafkajs';

export const kafkaProducerConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'user-management-producer',
      brokers: [process.env.KAFKA_BROKER],
    } as KafkaConfig,
    consumer: {
      groupId: 'user-validation-consumer',
    } as ConsumerConfig,
    producer: { allowAutoTopicCreation: false },
  },
};
