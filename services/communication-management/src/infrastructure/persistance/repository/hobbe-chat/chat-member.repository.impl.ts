import { Injectable } from '@nestjs/common';
import { ChatMemberRepository } from 'src/domain/repositories/hobbe-chat/chat-member.repository';
import { ChatMember } from 'src/domain/entities/hobbe-chat/chat-member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ChatMemberRepositoryImpl implements ChatMemberRepository {
  constructor(
    @InjectRepository(ChatMember)
    private readonly chatMemberRepo: Repository<ChatMember>,
  ) {}

  async addMember(chatId: string, userId: string): Promise<ChatMember> {
    const chatMember = this.chatMemberRepo.create({ chatId, userId });
    return this.chatMemberRepo.save(chatMember);
  }

  async removeMember(chatId: string, userId: string): Promise<void> {
    await this.chatMemberRepo.delete({ chatId, userId });
  }

  async findMember(chatId: string, userId: string): Promise<ChatMember | null> {
    return this.chatMemberRepo.findOne({ where: { chatId, userId } });
  }

  async getChatMembers(chatId: string): Promise<ChatMember[]> {
    return this.chatMemberRepo.find({ where: { chatId } });
  }
}
