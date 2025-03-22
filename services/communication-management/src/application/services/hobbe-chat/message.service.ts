import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ChatUser } from 'src/domain/entities/hobbe-chat/chat-user.entity';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';
import { Message } from 'src/domain/entities/hobbe-chat/message.entity';
import { ChatMemberRepository } from 'src/domain/repositories/hobbe-chat/chat-member.repository';
import { CHAT_MEMBER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-member.repository.token';
import { ChatRepository } from 'src/domain/repositories/hobbe-chat/chat.repository';
import { CHAT_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat.repository.token';
import { MessageRepository } from 'src/domain/repositories/hobbe-chat/message.repository';
import { CreateMessageDto } from 'src/presentation/dto/hobbe-chat/create-message.dto';
import { E2eeService } from './e2ee/e2ee.service';
import { MESSAGE_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/message.repository.token copy';

@Injectable()
export class MessageService {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepo: MessageRepository,
    @Inject(CHAT_REPOSITORY_TOKEN)
    private readonly chatRepo: ChatRepository,
    @Inject(CHAT_MEMBER_REPOSITORY_TOKEN)
    private readonly chatMemberRepo: ChatMemberRepository,
    private readonly e2eeService: E2eeService,
  ) {}

  async sendMessage(user: ChatUser, createMessageDto: CreateMessageDto): Promise<Message> {
    const chat = await this.chatRepo.findById(createMessageDto.chatId);
    if (!chat) throw new NotFoundException('Chat not found');

    const receiverId = this.getReceiverId(chat.members, user.id);
    const publicKey = await this.e2eeService.getPublicKey(receiverId);
    
    createMessageDto.content = this.e2eeService.encrypt(publicKey.publicKey.toString(), createMessageDto.content);
    const message = await this.messageRepo.sendMessage(user.id, createMessageDto);

    await Promise.all([
      this.chatRepo.updateLastMessage(chat.id, message.id),
      this.chatMemberRepo.incrementUnreadCount(chat, user),
    ]);

    const [friendPrivateKey, currentUserPrivateKey] = await Promise.all([
      this.e2eeService.getPrivateKey(receiverId),
      this.e2eeService.getPrivateKey(user.id),
    ]);

    message.content = this.decryptMessage(message.content, message.senderId, user.id, currentUserPrivateKey.privateKey.toString(), friendPrivateKey.privateKey.toString());
    
    chat.messages.forEach(msg => {
      msg.content = this.decryptMessage(msg.content, msg.senderId, user.id, currentUserPrivateKey.privateKey.toString(), friendPrivateKey.privateKey.toString());
    });

    return message;
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.messageRepo.softDeleteMessage(messageId);
  }

  async getChatMessages(user: ChatUser, chat: Chat): Promise<Message[]> {
    const chatExists = await this.chatRepo.findById(chat.id);
    if (!chatExists) throw new NotFoundException('Chat not found');

    const messages = await this.messageRepo.getChatMessages(chat.id);
    await this.chatMemberRepo.resetUnreadCount(chat, user);
    return messages;
  }

  private getReceiverId(members: any[], userId: string): string {
    return members.find(member => member.userId !== userId)?.userId;
  }

  private decryptMessage(content: string, senderId: string, userId: string, userPrivateKey: string, friendPrivateKey: string): string {
    const privateKey = senderId === userId ? friendPrivateKey : userPrivateKey;
    return this.e2eeService.decrypt(privateKey, content);
  }
}
