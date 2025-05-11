import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { Consumer, ConsumerRunConfig, ConsumerSubscribeTopics, Kafka } from "kafkajs";

@Injectable()
export class KafkaConsumerService implements OnApplicationShutdown{
    private readonly kafka = new Kafka({
        brokers: [process.env.KAFKA_BROKER],
    });

     private readonly consumers : Consumer[] = [];
     async consume(topics:ConsumerSubscribeTopics, config:ConsumerRunConfig){
        const consumer = this.kafka.consumer({
            groupId:'bank-account-list-sent',
            allowAutoTopicCreation: true,
        });
        await consumer.connect();
        await consumer.subscribe(topics);
        await consumer.run(config);
        this.consumers.push(consumer);
     }

     async paymentConsumer(topics:ConsumerSubscribeTopics, config:ConsumerRunConfig){
        const consumer = this.kafka.consumer({
            groupId:'payment_info_sent',
            allowAutoTopicCreation: true,
        });
        await consumer.connect();
        await consumer.subscribe(topics);
        await consumer.run(config);
        this.consumers.push(consumer);
     }

     async onApplicationShutdown() {
         for(const consumer of this.consumers){
            await consumer.disconnect();
         }
     }
}