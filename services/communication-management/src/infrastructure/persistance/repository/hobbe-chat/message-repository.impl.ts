import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/domain/entities/hobbe-chat/message.entity';
import { MessageRepository } from 'src/domain/repositories/hobbe-chat/message.repository';
import { Repository } from 'typeorm';


@Injectable()
export class MessageRepositoryImpl implements MessageRepository {
  constructor(@InjectRepository(Message) private readonly messageRepo: Repository<Message>) {}

  async sendMessage(chatId: string, senderId: string, content: string): Promise<Message> {
    const message = this.messageRepo.create({ chatId, senderId, content });
    return this.messageRepo.save(message);
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    return this.messageRepo.find({ where: { chatId }, order: { createdAt: 'ASC' } });
  }

  async softDeleteMessage(messageId: string): Promise<void> {
    await this.messageRepo.softDelete(messageId);
  }
}
