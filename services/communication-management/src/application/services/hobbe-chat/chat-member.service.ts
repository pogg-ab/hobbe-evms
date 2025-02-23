import { Inject, Injectable } from '@nestjs/common';
import { ChatMemberRepository } from 'src/domain/repositories/hobbe-chat/chat-member.repository';
import { CHAT_MEMBER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-member.repository.token';


@Injectable()
export class ChatMemberService {
  constructor(
    @Inject(CHAT_MEMBER_REPOSITORY_TOKEN)
    private readonly chatMemberRepo: ChatMemberRepository,
) {}

  async addMember(chatId: string, userId: string) {
    return this.chatMemberRepo.addMember(chatId, userId);
  }

  async removeMember(chatId: string, userId: string) {
    return this.chatMemberRepo.removeMember(chatId, userId);
  }
}
