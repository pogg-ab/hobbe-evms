import {
    Injectable,
    Logger,
    OnApplicationShutdown,
    OnModuleInit,
} from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { CreateStreamDto } from 'src/presentation/dtos/live-stream/create-stream.dto';

@Injectable()
export class StreamProducerService
    implements OnModuleInit, OnApplicationShutdown {
    private readonly kafka = new Kafka({
        brokers: [process.env.KAFKA_BROKER],
    });
    private readonly logger = new Logger(StreamProducerService.name);

    private readonly producer = this.kafka.producer();

    async onModuleInit() {
        try {
            await this.producer.connect();
            this.logger.log('Kafka producer connected successfully.');
        } catch (error) {
            this.logger.error('Failed to connect Kafka producer:', error);
        }
    }

    async sendStreamToKafka(
        createStreamDto: CreateStreamDto,
    ): Promise<{ success: boolean; message: string }> {
        const payload = {
            value: JSON.stringify(createStreamDto),
        };

        try {
            await this.producer.send({
                topic: 'schedule-stream',
                messages: [payload],
            });
            this.logger.log('Stream data successfully sent to Kafka topic.');
            return {
                success: true,
                message: 'Stream data successfully sent to Kafka topic',
            };
        } catch (error) {
            this.logger.error('Error sending stream creation data to Kafka topic:', error);
            return { success: false, message: 'Failed to send stream creation to Kafka topic' };
        }
    }





    async onApplicationShutdown() {
        try {
            await this.producer.disconnect();
            this.logger.log('Kafka producer disconnected.');
        } catch (error) {
            this.logger.error('Error disconnecting Kafka producer:', error);
        }
    }
}
