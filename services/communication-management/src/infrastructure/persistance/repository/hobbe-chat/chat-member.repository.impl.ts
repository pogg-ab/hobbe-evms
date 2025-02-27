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

  async addMember(chatId: string, userId: string,userName:string): Promise<ChatMember> {
    const chatMember = this.chatMemberRepo.create({ chatId, userId ,userName});
    return this.chatMemberRepo.save(chatMember);
  }

  async updateUserName(chatMember: ChatMember): Promise<ChatMember> {
    return this.chatMemberRepo.save(chatMember);
  }

  async removeMember(chatId: string, userId: string): Promise<void> {
    await this.chatMemberRepo.delete({ chatId, userId });
  }

  async findMember(chatId: string, userId: string): Promise<ChatMember | null> {
    return this.chatMemberRepo.findOne({ where: { chatId, userId } });
  }

  async getSingleChatMember(chatId: string, userId: string): Promise<ChatMember | null> {
    return this.chatMemberRepo.findOne({ where: { chatId, userId } });
  }

  async getChatMembers(chatId: string): Promise<ChatMember[]> {
    return this.chatMemberRepo.find({ where: { chatId } });
  }

  async incrementUnreadCount(chatId: string, senderId: string): Promise<void> {
    await this.chatMemberRepo
      .createQueryBuilder()
      .update(ChatMember)
      .set({ unreadCount: () => 'unreadCount + 1' })
      .where('chatId = :chatId AND userId != :senderId', { chatId, senderId })
      .execute();
  }


  async resetUnreadCount(chatId: string, userId: string): Promise<void> {
    await this.chatMemberRepo
    .createQueryBuilder()
    .update(ChatMember)
    .set({ unreadCount: 0 }) // Reset the unread count to 0
    .where('chatId = :chatId AND userId = :userId', { chatId, userId })
    .execute();
  }
}
