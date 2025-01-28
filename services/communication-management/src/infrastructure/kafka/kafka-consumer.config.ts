import { KafkaOptions, Transport } from '@nestjs/microservices';
import { KafkaConfig } from 'kafkajs';

export const kafkaConsumerConfig: KafkaOptions = {
    transport: Transport.KAFKA,
    options: {
        client: {
            clientId: 'user-management-consumer',
            brokers: [process.env.KAFKA_BROKER],
        } as KafkaConfig,
        consumer: {
            groupId: 'user-management-group',
        },
    },
};
