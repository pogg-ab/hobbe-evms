import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DeleteMessageCommand } from 'src/application/commands/hobbe-chat/delete-message.command';
import { GetChatMessagesQuery } from 'src/application/queries/hobbe-chat/get-chat-messages-query';
import { ChatUser } from 'src/domain/entities/hobbe-chat/chat-user.entity';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';
import { Message } from 'src/domain/entities/hobbe-chat/message.entity';
import { ChatMemberRepository } from 'src/domain/repositories/hobbe-chat/chat-member.repository';
import { CHAT_MEMBER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-member.repository.token';
import { ChatRepository } from 'src/domain/repositories/hobbe-chat/chat.repository';
import { CHAT_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat.repository.token';
import { MessageRepository } from 'src/domain/repositories/hobbe-chat/message.repository';
import { MESSAGE_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/message.repository.token copy';
import { CreateMessageDto } from 'src/presentation/dto/hobbe-chat/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepo: MessageRepository,
    @Inject(CHAT_REPOSITORY_TOKEN)
    private readonly chatRepo: ChatRepository,
    @Inject(CHAT_MEMBER_REPOSITORY_TOKEN)
    private readonly chatMemberRepo: ChatMemberRepository,
  ) {}

  async sendMessage(user: ChatUser, createMessageDto: CreateMessageDto):Promise<any> {
    const chat = await this.chatRepo.findById(createMessageDto.chatId);
    if (!chat) {
      return new NotFoundException('Chat not found');
    }
     const message =  await this.messageRepo.sendMessage(user.id, createMessageDto);
     await this.chatRepo.updateLastMessage(chat.id, message.id);
     await this.chatMemberRepo.incrementUnreadCount(chat, user);
     return message
  }

  async deleteMessage(messageId: string) {
    return this.messageRepo.softDeleteMessage(messageId);
  }

  async getChatMessages(user:ChatUser, chat: Chat): Promise<Message[]> {
    const getChat = await this.chatRepo.findById(chat.id);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    const messages = await this.messageRepo.getChatMessages(chat.id);
    await this.chatMemberRepo.resetUnreadCount(chat, user);
    return messages;
  }
}
