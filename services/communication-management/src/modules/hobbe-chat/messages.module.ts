import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs'; 
import { Message } from 'src/domain/entities/hobbe-chat/message.entity';
import { MessageController } from 'src/presentation/controller/hobbe-chat/message.controller';
import { MessageService } from 'src/application/services/hobbe-chat/message.service';
import { MESSAGE_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/message.repository.token copy';
import { MessageRepositoryImpl } from 'src/infrastructure/persistance/repository/hobbe-chat/message-repository.impl';
import { SendMessageHandler } from 'src/application/handlers/hobbe-chat/send-message.handler';
import { GetChatMessagesHandler } from 'src/application/handlers/hobbe-chat/get-chat-messages.handler';
import { DeleteMessageHandler } from 'src/application/handlers/hobbe-chat/delete-message.handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    CqrsModule, // ✅ Add this
  ],
  controllers: [MessageController],
  providers: [
    MessageService,
    SendMessageHandler,
    GetChatMessagesHandler,
    DeleteMessageHandler,
    { provide: MESSAGE_REPOSITORY_TOKEN, useClass: MessageRepositoryImpl },
  ],
  exports: [MESSAGE_REPOSITORY_TOKEN],
})
export class MessageModule {}
