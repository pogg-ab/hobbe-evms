import { Inject, Injectable } from '@nestjs/common';
import { ChatUser } from 'src/domain/entities/hobbe-chat/chat-user.entity';
import { ChatUserRepository } from 'src/domain/repositories/hobbe-chat/chat-user.repository';
import { CHAT_USER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-user.repository.token';

@Injectable()
export class ChatUserService {
  constructor(
   @Inject(CHAT_USER_REPOSITORY_TOKEN)
   private readonly chatUserRepository: ChatUserRepository,
) {}
    
     async chatUser(userId: string): Promise<ChatUser> {
        return await this.chatUserRepository.chatUser(userId);
     }
}
