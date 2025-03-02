import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateChatCommand } from 'src/application/commands/hobbe-chat/create-chat.command';
import { ChatRepository } from 'src/domain/repositories/hobbe-chat/chat.repository';
import { ChatMemberRepository } from 'src/domain/repositories/hobbe-chat/chat-member.repository';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';
import { ChatMember } from 'src/domain/entities/hobbe-chat/chat-member.entity';
import { CHAT_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat.repository.token';
import { CHAT_MEMBER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-member.repository.token';
import { AddChatMemberDto } from 'src/presentation/dto/hobbe-chat/add-chat-member.dto';
import { CreatePrivateChatDto } from 'src/presentation/dto/hobbe-chat/create-chat.dto';
import { randomInt } from 'crypto';

@Injectable()
export class ChatService {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN)
    private readonly chatRepo: ChatRepository,
    @Inject(CHAT_MEMBER_REPOSITORY_TOKEN)
    private readonly chatMemberRepo: ChatMemberRepository
  ) {}

  async createChat(user: any, createChatDto:CreatePrivateChatDto): Promise<any> {
    const chat_user = user.user.user_id.toString();
    const chat_user_name = user.user.user_name;
    // Check if private chat exists
    if (createChatDto.friendId) {
      const existingChat = await this.chatRepo.findPrivateChat(chat_user, createChatDto.friendId);
      if (existingChat) {
        const member = await this.getSingleChatMember(existingChat.id,createChatDto.friendId);
        if(member){
          member.userName = createChatDto.name;
          await this.updateChatMember(member); 
        }
        return { ...existingChat, isExisting:true};
      }
       
    }

    // Create a new chat


    const chat = await this.chatRepo.create("private",'@user' + randomInt(1000000000, 9999999999));
    await this.chatMemberRepo.addMember(chat.id,chat_user,chat_user_name);

    if (createChatDto.friendId) {
      await this.chatMemberRepo.addMember(chat.id, createChatDto.friendId,createChatDto.name);
    }
    return chat;
   
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    const chats = await this.chatRepo.getUserChats(userId);
    if (!chats.length) {
      throw new NotFoundException('No chats found for this user');
    }
    return chats;
  }
 

  async getChatById(chatId: string): Promise<Chat> {
    const chat = await this.chatRepo.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return chat;
  }

  async getChatMembers(chatId: string): Promise<any[]> {
    const members = await this.chatMemberRepo.getChatMembers(chatId);
    if (!members.length) {
      throw new NotFoundException('No members found for this chat');
    }
    return members;
  }

  async getSingleChatMember(chatId: string,userId:string): Promise<ChatMember | null> {
    const member = await this.chatMemberRepo.getSingleChatMember(chatId,userId);
    if (!member) {
      throw new NotFoundException('No members found for this chat');
    }
    return member;
  }

  async updateChatMember(chatMember: ChatMember): Promise<ChatMember> {
    return this.chatMemberRepo.updateUserName(chatMember);
  }

  async addChatMember(addChatMemberDto:AddChatMemberDto): Promise<ChatMember> {
     const chat  =  await this.chatRepo.findById(addChatMemberDto.chatId);
     if(!chat){
       throw new NotFoundException('Chat not found');
     }
    return this.chatMemberRepo.addMember(addChatMemberDto.chatId, addChatMemberDto.userName, addChatMemberDto.userId);
  }

  async removeChatMember(chatId: string, userId: string): Promise<void> {
    const member = await this.chatMemberRepo.findMember(chatId, userId);
    if (!member) {
      throw new NotFoundException('Member not found in this chat');
    }
    await this.chatMemberRepo.removeMember(chatId, userId);
  }

  async softDeleteChat(chatId: string): Promise<any> {
    return this.chatRepo.softDeleteChat(chatId);
  }

  async deleteChat(chatId: string): Promise<void> {
    const chat = await this.chatRepo.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    await this.chatRepo.delete(chatId);
  }
}

