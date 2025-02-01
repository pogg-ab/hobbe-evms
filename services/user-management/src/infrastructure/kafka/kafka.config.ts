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
      sessionTimeout: 30000, // Increase session timeout
      heartbeatInterval: 3000, // Adjust heartbeat interval
      groupInstanceId: 'consumer-1', // Enable static group membership
    } as ConsumerConfig,
    producer: {
      allowAutoTopicCreation: false,
    },
  },
};
