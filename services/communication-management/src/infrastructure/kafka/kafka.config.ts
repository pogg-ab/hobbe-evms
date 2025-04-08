import { KafkaOptions, Transport } from '@nestjs/microservices';
import { KafkaConfig } from 'kafkajs';

export const kafkaProducerConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'comm-auth-producer',
      brokers: [process.env.KAFKA_BROKER],
    } as KafkaConfig,
     consumer: {
          groupId: 'comm-consumer-group',
        },
    producer: { allowAutoTopicCreation: true },
  },
};
