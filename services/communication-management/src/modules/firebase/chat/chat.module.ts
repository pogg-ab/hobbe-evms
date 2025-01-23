import { Inject, Module } from '@nestjs/common';
import { ClientKafka, ClientsModule } from '@nestjs/microservices';
import { ChatService } from 'src/application/services/chat/chat.service';
import { kafkaProducerConfig } from 'src/infrastructure/kafka/kafka.config';
import { ChatController } from 'src/presentation/controller/chat/chat.controller';
import { JwtModule } from '@nestjs/jwt';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer.servicce';
import { UserValidationService } from 'src/application/services/chat/user-validation.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER',
        transport: kafkaProducerConfig.transport,
        options: kafkaProducerConfig.options,
      },
    ]),
  ],
  providers: [KafkaProducerService,
    UserValidationService,
    JwtStrategy,
    ChatService],
  controllers: [ChatController],
})
export class ChatModule {
  constructor(@Inject('KAFKA_PRODUCER') private client: ClientKafka) {}

  async onModuleInit() {
    this.client.subscribeToResponseOf('validateUser');
    await this.client.connect();
  }
}
