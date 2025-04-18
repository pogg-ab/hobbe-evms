import { Injectable } from '@nestjs/common';

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
    @InjectRepository(ChatMember)
    private readonly chatMemberRepo: Repository<ChatMember>,
  ) {}

  // async chatUser(userId: string,userName:string,profileName:string): Promise<ChatUser> {
  //   await this.chatUserRepo.upsert(
  //     { id: userId, username: userName,profileName:profileName },
  //     ['id'],
  //   );
  //   return this.chatUserRepo.findOne({ where: { id: userId } }); // Fetch the updated entity
  // }

  
  async create(userId: string, userName: string, profileName: string): Promise<ChatUser> {
    return await this.chatUserRepo.save({ id: userId, username: userName, profileName });
  }

  async findOne(userId: string): Promise<ChatUser> {
    return this.chatUserRepo.findOne({ where: { id: userId } });
  }
  
  
  async update(userId: string, userName: string, profileName: string): Promise<void> {
    await this.chatUserRepo.update(userId, { username: userName, profileName });
  }
  

  async chatUserStatus(userId: string, isOnline: boolean): Promise<void> {
    const user = await this.chatUserRepo.findOne({ where: { id:userId } });

    if(user){
      await this.chatUserRepo.update(
        { id: userId },
        { isOnline: isOnline, lastSeenAt: new Date() },
      );
    }
    
    const member = await this.chatMemberRepo.findOne({ where: { userId } });
    if (member) {
      await this.chatMemberRepo.update({ userId }, { isActive: isOnline });
    }

    // await this.chatMemberRepo.update({ userId: userId }, { isActive: isOnline });
  }

  async delete(id: string): Promise<void> {
    await this.chatUserRepo.delete(id);
  }
}
