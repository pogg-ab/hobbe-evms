import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CHAT_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat.repository.token';
import { CHAT_MEMBER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-member.repository.token';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';
import { ChatMember } from 'src/domain/entities/hobbe-chat/chat-member.entity';
import { ChatService } from 'src/application/services/hobbe-chat/chat.service';
import { ChatMemberRepositoryImpl } from 'src/infrastructure/persistance/repository/hobbe-chat/chat-member.repository.impl';
import { ChatRepositoryImpl } from 'src/infrastructure/persistance/repository/hobbe-chat/chat.repository.impl';
import { ChatController } from 'src/presentation/controller/hobbe-chat/chat.controller';
import { CreateChatHandler } from 'src/application/handlers/hobbe-chat/create-chat.handler';
import { GetUserChatsQuery } from 'src/application/queries/hobbe-chat/get-user-chat.query';
import { GetUserChatsHandler } from 'src/application/handlers/hobbe-chat/get-user.chats.handler';
import { DeleteChatHandler } from 'src/application/handlers/hobbe-chat/delete-chat-handler';
import { AddChatMemberHandler } from 'src/application/handlers/hobbe-chat/add-chat-member.handler';


@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMember]),
    CqrsModule,  // Add this line to import CqrsModule
  ],
  providers: [
    ChatService,
    CreateChatHandler,
    GetUserChatsHandler,
    AddChatMemberHandler,
    DeleteChatHandler,
    { provide: CHAT_REPOSITORY_TOKEN, useClass: ChatRepositoryImpl },
    { provide: CHAT_MEMBER_REPOSITORY_TOKEN, useClass: ChatMemberRepositoryImpl },
  ],
  controllers: [ChatController],
})
export class ChatModule {}
