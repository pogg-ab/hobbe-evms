import { KafkaOptions, Transport } from '@nestjs/microservices';
import { KafkaConfig } from 'kafkajs';

export const kafkaCheckinPrivilegeConfig: KafkaOptions = {
    transport: Transport.KAFKA,
    options: {
        client: {
            clientId: 'ticket-checkin-privilege-service',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
        } as KafkaConfig,
        consumer: {
            groupId: 'ticket-checkin-privilege-consumer',
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