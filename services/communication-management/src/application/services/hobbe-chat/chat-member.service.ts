import { Inject, Injectable } from '@nestjs/common';
import { ChatMemberRepository } from 'src/domain/repositories/hobbe-chat/chat-member.repository';
import { CHAT_MEMBER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-member.repository.token';
import { AddChatMemberDto } from 'src/presentation/dto/hobbe-chat/add-chat-member.dto';


@Injectable()
export class ChatMemberService {
  constructor(
    @Inject(CHAT_MEMBER_REPOSITORY_TOKEN)
    private readonly chatMemberRepo: ChatMemberRepository,
) {}

  async addMember(addChatMemberDto:AddChatMemberDto) {
    return this.chatMemberRepo.addMember(addChatMemberDto.chatId, addChatMemberDto.userName, addChatMemberDto.userId);
  }

  async removeMember(chatId: string, userId: string) {
    return this.chatMemberRepo.removeMember(chatId, userId);
  }
}
