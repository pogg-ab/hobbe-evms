import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { Chat } from 'src/domain/entities/chat.entity';
import { IChatRepository } from 'src/domain/repositories/chat/chat.repository';
import { CHAT_REPOSITORY_TOKEN } from 'src/domain/repositories/chat/chat.repository.token';
import { CreateChatDto } from 'src/presentation/dto/chat/create-chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN)
    private readonly createChatRepository: IChatRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}
  // private chatRef = firebaseDatabase.ref('chats'); // Realtime DB "chats" node
  private chatRef = null; // Realtime DB "chats" node

  async sendMessage(chatRoom: string, message: any): Promise<void> {
    await this.chatRef.child(chatRoom).push(message);
  }

  async getMessages(chatRoom: string): Promise<any[]> {
    const snapshot = await this.chatRef.child(chatRoom).once('value');
    const messages = snapshot.val();
    return messages ? Object.values(messages) : [];
  }

  async createMessage(
    sender_id: string,
    createChatDto: CreateChatDto,
  ): Promise<any> {
    const mappedChat = this.mapper.map(createChatDto, CreateChatDto, Chat);
    mappedChat.sender_id = sender_id;

    const message = await this.createChatRepository.create(mappedChat);
    if (message) {
      await this.chatRef.child(message.room).push(message);
    }
  }
}
