import { Inject, Injectable } from '@nestjs/common';
import { ChatUser } from 'src/domain/entities/hobbe-chat/chat-user.entity';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';
import { ChatMemberRepository } from 'src/domain/repositories/hobbe-chat/chat-member.repository';
import { CHAT_MEMBER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-member.repository.token';
import { AddChatMemberDto } from 'src/presentation/dto/hobbe-chat/add-chat-member.dto';


@Injectable()
export class ChatMemberService {
  constructor(
    @Inject(CHAT_MEMBER_REPOSITORY_TOKEN)
    private readonly chatMemberRepo: ChatMemberRepository,
) {}

  async addMember(chat:Chat,user:ChatUser) {
    return this.chatMemberRepo.addMember(chat, user);
  }

  async removeMember(chat: Chat, user: ChatUser) {
    return this.chatMemberRepo.removeMember(chat, user);
  }
}
