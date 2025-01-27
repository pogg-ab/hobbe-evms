import { KafkaOptions, Transport } from '@nestjs/microservices';
import { KafkaConfig } from 'kafkajs';

export const kafkaProducerConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'user-management-producer',
      brokers: [process.env.KAFKA_BROKER],
    } as KafkaConfig,
    producer: { allowAutoTopicCreation: false },
  },
};
