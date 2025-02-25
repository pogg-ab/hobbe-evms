import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs'; // ✅ Import CqrsModule
import { ChatMemberService } from 'src/application/services/hobbe-chat/chat-member.service';
import { ChatMember } from 'src/domain/entities/hobbe-chat/chat-member.entity';
import { CHAT_MEMBER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-member.repository.token';
import { ChatMemberRepositoryImpl } from 'src/infrastructure/persistance/repository/hobbe-chat/chat-member.repository.impl';
import { ChatMemberController } from 'src/presentation/controller/hobbe-chat/chat-member.controller';
import { AddChatMemberHandler } from 'src/application/handlers/hobbe-chat/add-chat-member.handler';
import { RemoveChatMemberHandler } from 'src/application/handlers/hobbe-chat/remove.chat-member.handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMember]),
    CqrsModule, // ✅ Add this
  ],
  controllers: [ChatMemberController],
  providers: [
    ChatMemberService,
    // AddChatMemberHandler,
    RemoveChatMemberHandler,
    { provide: CHAT_MEMBER_REPOSITORY_TOKEN, useClass: ChatMemberRepositoryImpl },
  ],
  exports: [CHAT_MEMBER_REPOSITORY_TOKEN],
})
export class ChatMemberModule {}
