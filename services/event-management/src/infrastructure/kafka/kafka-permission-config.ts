import { KafkaOptions, Transport } from '@nestjs/microservices';
import { KafkaConfig } from 'kafkajs';

export const kafkaPermissionConfig: KafkaOptions = {
    transport: Transport.KAFKA,
    options: {
        client: {
            clientId: 'event-permission-service',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],

        } as KafkaConfig,
        consumer: {
            groupId: 'event-permission-consumer',
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