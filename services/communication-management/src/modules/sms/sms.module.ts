import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientKafka } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SendSmsHandler } from 'src/application/handlers/sms/send-sms.command-handler';
import { SMSSenderService } from 'src/application/services/sms/sms-sender.service';
import { SMS } from 'src/domain/entities/sms.entity';
import { SMS_REPOSITORY_TOKEN } from 'src/domain/repositories/sms/sms.repository.token';
import { kafkaConsumerConfig } from 'src/infrastructure/kafka/kafka.consumer.config';
import { SMSRepositoryImpl } from 'src/infrastructure/persistance/repository/sms.repository.impl';
import { SMSProvider } from 'src/infrastructure/sms/sms.provider';
import { SmsController } from 'src/presentation/controller/sms/sms.controller';

@Module({
  imports: [AutomapperModule, CqrsModule, TypeOrmModule.forFeature([SMS])],
  controllers: [SmsController],
  providers: [
    SMSProvider,
    {
      provide: SMS_REPOSITORY_TOKEN,
      useClass: SMSRepositoryImpl,
    },
    {
      provide: 'KAFKA_CONSUMER',
      useFactory: async () => {
        const client = new ClientKafka(kafkaConsumerConfig.options);
        try {
          await client.connect();
          return client;
        } catch (error) {
          console.error('Error connecting to Kafka:', error);
          throw error;
        }
      },
    },
    SMSSenderService,
    SendSmsHandler,
    SMSRepositoryImpl,
  ],
  exports: [SMS_REPOSITORY_TOKEN, SMSRepositoryImpl, SMSSenderService],
})
export class SmsModule {}
