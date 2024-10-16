import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export const kafkaConfig: MicroserviceOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: [process.env.KAFKA_BROKER],
    },
    consumer: {
      groupId: 'event-management-consumer',
    },
  },
};
