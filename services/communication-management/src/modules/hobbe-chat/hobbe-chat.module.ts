import { Inject, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateChatHandler } from 'src/application/handlers/hobbe-chat/create-chat.handler';
import { GetMessagesHandler } from 'src/application/handlers/hobbe-chat/get-messages.handler';
import { SendMessageHandler } from 'src/application/handlers/hobbe-chat/send-message.handler';
import { ChatMember } from 'src/domain/entities/hobbe-chat/chat-member.entity';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';
import { Message } from 'src/domain/entities/hobbe-chat/message.entity';
import { ChatMemberRepository } from 'src/domain/repositories/hobbe-chat/chat-member.repository';
import { ChatRepository } from 'src/domain/repositories/hobbe-chat/chat.repository';
import { MessageRepository } from 'src/domain/repositories/hobbe-chat/message.repository';
import { ChatController } from 'src/presentation/controller/hobbe-chat/chat.controller';
import { ChatModule } from './chat.module';
import { ChatMemberModule } from './chat-member.module';
import { MessageModule } from './messages.module';
import { ClientKafka, ClientsModule } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { kafkaProducerConfig } from 'src/infrastructure/kafka/kafka.config';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer.servicce';
import { UserValidationService } from 'src/application/services/hobbe-chat/user-validation.service';
import { JwtStrategy } from './jwt.strategy';



@Module({
  imports: [
    CqrsModule, 
    TypeOrmModule.forFeature([Chat, ChatMember,Message]),
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
    ChatModule,
    ChatMemberModule,
    MessageModule
],
  controllers: [],
   
    providers: [ 
      KafkaProducerService,
      UserValidationService,
      JwtStrategy,
      ],
})
export class HobbeChatModule {

  constructor(@Inject('KAFKA_PRODUCER') private client: ClientKafka) { }

  async onModuleInit() {
    this.client.subscribeToResponseOf('validateUser');
    await this.client.connect();
  }
}
