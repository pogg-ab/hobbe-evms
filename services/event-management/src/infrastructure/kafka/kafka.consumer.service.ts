import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { Consumer, ConsumerRunConfig, ConsumerSubscribeTopics, Kafka } from "kafkajs";

@Injectable()
export class KafkaConsumerService implements OnApplicationShutdown{
    private readonly kafka = new Kafka({
        brokers: [process.env.KAFKA_BROKER],
    });

     private readonly consumers : Consumer[] = [];
     async paymentLinkConsume(topics:ConsumerSubscribeTopics, config:ConsumerRunConfig){
        const consumer = this.kafka.consumer({
            groupId:'payment_link',
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