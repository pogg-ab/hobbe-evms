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
import { SocketGateway } from 'src/application/services/hobbe-chat/socket-io/socket.gateway';
import { CHAT_USER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-user.repository.token';
import { ChatUserRepositoryImpl } from 'src/infrastructure/persistance/repository/hobbe-chat/chat-user.repository.impl';
import { ChatUser } from 'src/domain/entities/hobbe-chat/chat-user.entity';
import { E2eeService } from 'src/application/services/hobbe-chat/e2ee/e2ee.service';
import { E2EERepositoryImpl } from 'src/infrastructure/persistance/repository/hobbe-chat/e2ee.repository.impl';
import { E2EE_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/e2ee/e2ee.repository.token';
import { E2EE } from 'src/domain/entities/hobbe-chat/e2ee.entity';
import { FindChatByIdQueryHandler } from 'src/application/handlers/hobbe-chat/find-chat-by-id.handler';
import { ChatUserService } from 'src/application/services/hobbe-chat/socket-io/user-service/chat-user-service';


@Module({
  imports: [
    
    TypeOrmModule.forFeature([ChatUser,Chat, ChatMember,E2EE]),
    CqrsModule,  // Add this line to import CqrsModule
  ],
  providers: [
    ChatService,
    ChatUserService,
    E2eeService,

    CreateChatHandler,
    GetUserChatsHandler,
    AddChatMemberHandler,
    FindChatByIdQueryHandler,
    DeleteChatHandler,
    { provide: CHAT_USER_REPOSITORY_TOKEN, useClass: ChatUserRepositoryImpl },
    { provide: CHAT_REPOSITORY_TOKEN, useClass: ChatRepositoryImpl },
    { provide: CHAT_MEMBER_REPOSITORY_TOKEN, useClass: ChatMemberRepositoryImpl },
         { provide: E2EE_REPOSITORY_TOKEN, useClass: E2EERepositoryImpl },
    
  ],
  controllers: [ChatController],
})
export class ChatModule {}
