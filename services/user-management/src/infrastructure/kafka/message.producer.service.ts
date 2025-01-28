import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { CreateEmailDto } from 'src/presentation/dtos/create-email.dto';
import { CreateSmsDto } from 'src/presentation/dtos/create-sms.dto';

@Injectable()
export class MessageProducerService
  implements OnModuleInit, OnApplicationShutdown {
  private readonly kafka = new Kafka({
    brokers: [process.env.KAFKA_BROKER],
  });
  private readonly logger = new Logger(MessageProducerService.name);

  private readonly producer = this.kafka.producer();

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('Kafka producer connected successfully.');
    } catch (error) {
      this.logger.error('Failed to connect Kafka producer:', error);
    }
  }

  async sendEmailToKafka(
    createEmailDto: CreateEmailDto,
  ): Promise<{ success: boolean; message: string }> {
    const payload = {
      value: JSON.stringify(createEmailDto),
    };

    try {
      await this.producer.send({
        topic: 'send-email',
        messages: [payload],
      });
      this.logger.log('Email data successfully sent to Kafka topic.');
      return {
        success: true,
        message: 'Email data successfully sent to Kafka topic',
      };
    } catch (error) {
      this.logger.error('Error sending email to Kafka topic:', error);
      return { success: false, message: 'Failed to send email to Kafka topic' };
    }
  }

  async sendSmsToKafka(
    createSmsDto: CreateSmsDto,
  ): Promise<{ success: boolean; message: string }> {
    const payload = {
      value: JSON.stringify(createSmsDto),
    };

    try {
      await this.producer.send({
        topic: 'send-sms',
        messages: [{ value: JSON.stringify(payload) }],
      });
      this.logger.log('SMS data successfully sent to Kafka topic.');
      return {
        success: true,
        message: 'SMS data successfully sent to Kafka topic',
      };
    } catch (error) {
      this.logger.error('Error sending SMS to Kafka topic:', error);
      return { success: false, message: 'Failed to send SMS to Kafka topic' };
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
