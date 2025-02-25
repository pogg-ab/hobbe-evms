import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DeleteMessageCommand } from 'src/application/commands/hobbe-chat/delete-message.command';
import { GetChatMessagesQuery } from 'src/application/queries/hobbe-chat/get-chat-messages-query';
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

  async sendMessage(user: string, createMessageDto: CreateMessageDto):Promise<Message> {
    const chat = await this.chatRepo.findById(createMessageDto.chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
     const message =  await this.messageRepo.sendMessage(user, createMessageDto);
     await this.chatRepo.updateLastMessage(chat.id, message.id);
     await this.chatMemberRepo.incrementUnreadCount(chat.id, message.senderId);
     return message;
  }

  async deleteMessage(messageId: string) {
    return this.messageRepo.softDeleteMessage(messageId);
  }

  async getChatMessages(user:string,chatId: string): Promise<Message[]> {
    const chat = await this.chatRepo.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    const messages = await this.messageRepo.getChatMessages(chatId);
    await this.chatMemberRepo.resetUnreadCount(chatId, user);
    return messages;
  }
}
