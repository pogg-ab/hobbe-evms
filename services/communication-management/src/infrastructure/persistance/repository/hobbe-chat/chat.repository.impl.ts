import { Injectable } from '@nestjs/common';
import { ChatRepository } from 'src/domain/repositories/hobbe-chat/chat.repository';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMember } from 'src/domain/entities/hobbe-chat/chat-member.entity';

@Injectable()
export class ChatRepositoryImpl implements ChatRepository {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    @InjectRepository(ChatMember)
    private readonly chatMemberRepo: Repository<ChatMember>,
  ) {}

  async create(type: string, name?: string): Promise<Chat> {
    const chat = this.chatRepo.create({ type, name });
    return await this.chatRepo.save(chat);
  }

  async updateLastMessage(
    chatId: string,
    lastMessageId: string,
  ): Promise<void> {
    await this.chatRepo.update(chatId, {
      lastMessage: { id: lastMessageId },
      updatedAt: new Date(),
    } as any);
  }

  async findById(chatId: string): Promise<Chat | null> {
    return await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['members'],
    });
  }

  async findPrivateChat(
    userId: string,
    friendId: string,
  ): Promise<Chat | null> {
    return this.chatRepo
      .createQueryBuilder('chat')
      .innerJoin('chat.members', 'member1', 'member1.userId = :userId', {
        userId,
      })
      .innerJoin('chat.members', 'member2', 'member2.userId = :friendId', {
        friendId,
      })
      .where('chat.type = :type', { type: 'private' })
      .getOne();
  }

  // async getUserChats(userId: string): Promise<Chat[]> {
  //   return await this.chatRepo
  //     .createQueryBuilder('chat')
  //     .leftJoin('chat.members', 'chatMember')
     
  //     .where('chatMember.userId = :userId', { userId })
  //     .leftJoinAndSelect('chat.lastMessage', 'lastMessage')
  //     // .addSelect('friend.userName', 'friend')
  //     .addSelect('chatMember.unreadCount', 'unreadMessages')
  //     .addSelect('friend.isActive', 'isOnline')
  //     .orderBy('chat.updatedAt', 'DESC')
  //     .getRawMany();
  // }

  async getUserChats(userId: string): Promise<any[]> {
    return await this.chatRepo
      .createQueryBuilder('chat')
      .leftJoin('chat.members', 'chatMember')
      .leftJoin('chat.members', 'friendMember', 'friendMember.userId != :userId', { userId })
      .leftJoin('friendMember.user', 'friend')
      .leftJoin('chat.lastMessage', 'lastMessage')
      .where('chatMember.userId = :userId', { userId })
      .select([
        'chat.id AS chat_id',
        'chat.type AS chat_type',
        'friend.username AS username',
        'friend.profileName AS profile_name',
        'friend.avatarUrl AS avatar',
        'friend.isOnline AS isonline',
        'lastMessage.id AS message_id',
        'lastMessage.senderId AS sender_id',
        'lastMessage.content AS content',
        'lastMessage.createdAt AS created_at',
        'chatMember.unreadCount AS unreadmessages',
      
      ])
      .orderBy('chat.updatedAt', 'DESC')
      .getRawMany();

  }
  
  
  

  async softDeleteChat(chatId: string): Promise<void> {
    await this.chatRepo.update(chatId, { deletedAt: new Date() });
  }

  async delete(chatId: string): Promise<void> {
    await this.chatRepo.delete(chatId);
  }
}
