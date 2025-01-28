import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientKafka } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SendEmailHandler } from 'src/application/handlers/email/send-email.command-handler';
import { EmailProfile } from 'src/application/mappers/email.profile';
import { EmailService } from 'src/application/services/email/email.service';
import { Email } from 'src/domain/entities/email.entity';
import { EMAIL_REPOSITORY_TOKEN } from 'src/domain/repositories/email/email.repository.token';
import { kafkaConsumerConfig } from 'src/infrastructure/kafka/kafka.consumer.config';
import { EmailRepositoryImpl } from 'src/infrastructure/persistance/repository/email.repository.impl';
import { EmailController } from 'src/presentation/controller/email/email.controller';
import { EmailSenderService } from '../../infrastructure/email/email-sender.service';

@Module({
  imports: [AutomapperModule, CqrsModule, TypeOrmModule.forFeature([Email])],
  controllers: [EmailController],
  providers: [
    EmailProfile,
    {
      provide: EMAIL_REPOSITORY_TOKEN,
      useClass: EmailRepositoryImpl,
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
    EmailService,
    EmailSenderService,
    SendEmailHandler,
    EmailRepositoryImpl,
  ],
  exports: [EMAIL_REPOSITORY_TOKEN, EmailRepositoryImpl, EmailSenderService],
})
export class EmailModule {}
