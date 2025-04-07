import { KafkaOptions, Transport } from '@nestjs/microservices';
import { KafkaConfig } from 'kafkajs';

export const kafkaUserInfoConfig: KafkaOptions = {
    transport: Transport.KAFKA,
    options: {
        client: {
            clientId: 'comunication-user-info-service',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
        } as KafkaConfig,
        consumer: {
            groupId: 'comunication-user-info-consumer',
            allowAutoTopicCreation: true,
        },
        producer: {
            allowAutoTopicCreation: false,
            idempotent: true,
            transactionTimeout: 30000,
        },
        run: {
            autoCommit: false,
        },
    },
};