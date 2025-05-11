import { Inject, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMember } from 'src/domain/entities/hobbe-chat/chat-member.entity';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';
import { Message } from 'src/domain/entities/hobbe-chat/message.entity';
import { ChatModule } from './chat.module';
import { ChatMemberModule } from './chat-member.module';
import { MessageModule } from './messages.module';
import { ClientKafka, ClientsModule } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { kafkaProducerConfig } from 'src/infrastructure/kafka/kafka.config';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer.servicce';
import { UserValidationService } from 'src/application/services/hobbe-chat/user-validation.service';
import { JwtStrategy } from './jwt.strategy';
import { SocketGateway } from 'src/application/services/hobbe-chat/socket-io/socket.gateway';
import { HobbeChatService } from 'src/application/services/hobbe-chat/socket-io/chat-service/hobbe-chat-service';
import { CHAT_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat.repository.token';
import { CHAT_MEMBER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-member.repository.token';
import { ChatRepositoryImpl } from 'src/infrastructure/persistance/repository/hobbe-chat/chat.repository.impl';
import { ChatMemberRepositoryImpl } from 'src/infrastructure/persistance/repository/hobbe-chat/chat-member.repository.impl';
import { MessageGateway } from 'src/application/services/hobbe-chat/socket-io/message.gateway';
import { MessageService } from 'src/application/services/hobbe-chat/socket-io/message-service/message-service';
import { ChatGateway } from 'src/application/services/hobbe-chat/socket-io/chat.gateway';
import { ChatUserService } from 'src/application/services/hobbe-chat/socket-io/user-service/chat-user-service';
import { CHAT_USER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-user.repository.token';
import { ChatUserRepositoryImpl } from 'src/infrastructure/persistance/repository/hobbe-chat/chat-user.repository.impl';
import { ChatUser } from 'src/domain/entities/hobbe-chat/chat-user.entity';
import { E2EEModule } from './e2ee/e2ee.module';



@Module({
  imports: [
    CqrsModule,
    E2EEModule,
    TypeOrmModule.forFeature([ChatUser, Chat, ChatMember, Message]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    ClientsModule.register([
      {
        name: 'KAFKA_VALIDATE_USER_SERVICE',
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
    HobbeChatService,
    ChatUserService,
    MessageService,
    SocketGateway,

    ChatGateway,
    MessageGateway,

    { provide: CHAT_USER_REPOSITORY_TOKEN, useClass: ChatUserRepositoryImpl },
    { provide: CHAT_REPOSITORY_TOKEN, useClass: ChatRepositoryImpl },
    { provide: CHAT_MEMBER_REPOSITORY_TOKEN, useClass: ChatMemberRepositoryImpl },
  ],
})
export class HobbeChatModule {
  constructor(@Inject('KAFKA_VALIDATE_USER_SERVICE') private client: ClientKafka) { }
  async onModuleInit() {
    this.client.subscribeToResponseOf('validateUser');
    await this.client.connect();
  }
 }
