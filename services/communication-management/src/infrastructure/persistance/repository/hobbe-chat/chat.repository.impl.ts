import { Injectable } from '@nestjs/common';
import { ChatRepository } from 'src/domain/repositories/hobbe-chat/chat.repository';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ChatRepositoryImpl implements ChatRepository {
  constructor(
    @InjectRepository(Chat)

    private readonly chatRepo: Repository<Chat>,
  ) {}

  async create(type: string, name?: string): Promise<Chat> {
    const chat = this.chatRepo.create({ type, name });
    return this.chatRepo.save(chat);
  }

  async findById(chatId: string): Promise<Chat | null> {
    return this.chatRepo.findOne({ where: { id: chatId } });
  }

  async findPrivateChat(userId: string, friendId: string): Promise<Chat | null> {
    return this.chatRepo.findOne({ where: { type: 'private', members: { userId } } });
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    return this.chatRepo.find({ where: { members: { userId } } });
  }

  async softDeleteChat(chatId: string): Promise<void> {
    await this.chatRepo.update(chatId, { deletedAt: new Date() });
  }

  async delete(chatId: string): Promise<void> {
    await this.chatRepo.delete(chatId);
  }
}
