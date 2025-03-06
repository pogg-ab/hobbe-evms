import { Injectable } from '@nestjs/common';
import { ChatMemberRepository } from 'src/domain/repositories/hobbe-chat/chat-member.repository';
import { ChatMember } from 'src/domain/entities/hobbe-chat/chat-member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatUserRepository } from 'src/domain/repositories/hobbe-chat/chat-user.repository';
import { ChatUser } from 'src/domain/entities/hobbe-chat/chat-user.entity';
import { randomInt } from 'crypto';

@Injectable()
export class ChatUserRepositoryImpl implements ChatUserRepository {
  constructor(
    @InjectRepository(ChatUser)
    private readonly chatUserRepo: Repository<ChatUser>,
  ) {}

  async chatUser(userId: string): Promise<ChatUser> {
    await this.chatUserRepo.upsert(
        { id: userId, username: '@user' + randomInt(1000000000, 9999999999) },
        ['id']
    );
    return this.chatUserRepo.findOne({ where: { id: userId } }); // Fetch the updated entity
  }
}