import { Injectable } from '@nestjs/common';
import { ChatMemberRepository } from 'src/domain/repositories/hobbe-chat/chat-member.repository';
import { ChatMember } from 'src/domain/entities/hobbe-chat/chat-member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';
import { ChatUser } from 'src/domain/entities/hobbe-chat/chat-user.entity';

@Injectable()
export class ChatMemberRepositoryImpl implements ChatMemberRepository {
  constructor(
    @InjectRepository(ChatMember)
    private readonly chatMemberRepo: Repository<ChatMember>,
  ) {}

  async addMember(chat: Chat, user: ChatUser): Promise<ChatMember> {
    // const chatMember = this.chatMemberRepo.create({ chatId, userId ,userName});
    const chatMember = this.chatMemberRepo.create({ chat, user});
    return this.chatMemberRepo.save(chatMember);
  }

  async updateUserName(chat: Chat): Promise<ChatMember> {
    return this.chatMemberRepo.save(chat);
  }

  async removeMember(chat: Chat, user: ChatUser): Promise<void> {
    await this.chatMemberRepo.delete({ chat, user});
  }

  async findMember(chat: Chat, user: ChatUser): Promise<ChatMember | null> {
    return this.chatMemberRepo.findOne({ where: { chat, user } });
  }

  async getSingleChatMember(chat: Chat, user: ChatUser): Promise<ChatMember | null> {
    return this.chatMemberRepo.findOne({ where: { chat, user} });
  }

  async getChatMembers(chat: Chat): Promise<ChatMember[]> {
    return await this.chatMemberRepo.find({ where: { chatId:chat.id} });
  }

  async incrementUnreadCount(chat: Chat, user: ChatUser): Promise<void> {
    const params = { chatId: chat.id, senderId: user.id };
    console.log('Query params:', params);
    await this.chatMemberRepo
       .createQueryBuilder()
       .update(ChatMember)
       .set({ unreadCount: () => 'unreadCount + 1' })
       .where('chatId = :chatId AND userId != :senderId', params)
       .execute();
  }


  async resetUnreadCount(chat: Chat, user: ChatUser): Promise<void> {
    await this.chatMemberRepo
    .createQueryBuilder()
    .update(ChatMember)
    .set({ unreadCount: 0 }) // Reset the unread count to 0
    .where('chatId = :chatId AND userId = :userId', { chat, user })
    .execute();
  }
}
