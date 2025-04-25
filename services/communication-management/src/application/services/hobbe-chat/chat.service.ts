import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { ChatUserRepository } from 'src/domain/repositories/hobbe-chat/chat-user.repository';
import { CHAT_USER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-user.repository.token';
import { ChatUser } from 'src/domain/entities/hobbe-chat/chat-user.entity';
import { E2eeService } from './e2ee/e2ee.service';

@Injectable()
export class ChatService {
  constructor(
    @Inject(CHAT_USER_REPOSITORY_TOKEN)
    private readonly chatUserRepo: ChatUserRepository,
    @Inject(CHAT_REPOSITORY_TOKEN)
    private readonly chatRepo: ChatRepository,
    @Inject(CHAT_MEMBER_REPOSITORY_TOKEN)
    private readonly chatMemberRepo: ChatMemberRepository,
    private readonly e2eeService: E2eeService,
  ) {}

  async createChat(
    user: any,
    createChatDto: CreatePrivateChatDto,
  ): Promise<any> {

    const friend = await this.chatUserRepo.findOne(createChatDto.friendId);
    if (!friend) {
      throw new BadRequestException(`It looks like your friend hasn't joined Hobbe Chat yet.
      Invite them now so you can stay connected and enjoy seamless conversations together!`);
    }
    
    const chat_user = user.user.user_id.toString();
    const profile_id = user.user.profile_id.toString();
    const profile_name = user.user.profile_name.toString();
    const profileImage = user.user.personal_account.profile_image.toString();
    // Check if private chat exists
    if (createChatDto.friendId) {
      const existingChat = await this.chatRepo.findPrivateChat(
        chat_user,
        createChatDto.friendId,
      );
      if (existingChat) {
        return { ...existingChat, isExisting: true };
      }
    }

    // Create a new chat

    const chat = await this.chatRepo.create(
      'private',
      '@chat' + randomInt(100000000000, 999999999999),
    );
    const chatUser = await this.chatUserRepo.create(chat_user,profile_id,profile_name,profileImage);
    await this.chatMemberRepo.addMember(chat, chatUser);

    await this.chatMemberRepo.addMember(chat, friend);

    const members = await this.chatMemberRepo.getChatMembers(chat);
    return { ...chat, members: members };
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    const chats = await this.chatRepo.getUserChats(userId);
    if (!chats.length) {
      return [];
    }
  
    for (const chat of chats) {
      const currentChat = await this.chatRepo.findById(chat['chat_id']);
      if (currentChat) {
        const receiverId = this.getReceiverId(currentChat.members, userId);
        const [friendPrivateKey, currentUserPrivateKey] = await Promise.all([
          this.e2eeService.getPrivateKey(receiverId),
          this.e2eeService.getPrivateKey(userId),
        ]);
  
        if (chat['content']) {
          chat['content'] = this.e2eeService.decryptMessage(
            chat['content'],
            chat['sender_id'],
            userId,
            currentUserPrivateKey.privateKey.toString(),
            friendPrivateKey.privateKey.toString(),
          );
        }
      }
    }
  
    return chats;
  }
  

  async getChatById(userId:string,chatId: string): Promise<Chat> {
    const chat = await this.chatRepo.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }    
    const receiverId = this.getReceiverId(chat.members, userId);
    const [friendPrivateKey, currentUserPrivateKey] = await Promise.all([
      this.e2eeService.getPrivateKey(receiverId),
      this.e2eeService.getPrivateKey(userId),
    ]);
    chat.messages.forEach(msg => {
      msg.content =  this.e2eeService.decryptMessage(msg.content, msg.senderId, userId, currentUserPrivateKey.privateKey.toString(), friendPrivateKey.privateKey.toString());
    });
    return chat;
  }

  async getChatMembers(chat: Chat): Promise<any[]> {
    const members = await this.chatMemberRepo.getChatMembers(chat);
    if (!members.length) {
      throw new NotFoundException('No members found for this chat');
    }
    return members;
  }

  async getSingleChatMember(
    chat: Chat,
    user: ChatUser,
  ): Promise<ChatMember | null> {
    const member = await this.chatMemberRepo.getSingleChatMember(chat, user);
    if (!member) {
      throw new NotFoundException('No members found for this chat');
    }
    return member;
  }

  // async updateChatMember(chat: ChatMember): Promise<ChatMember> {
  //   return this.chatMemberRepo.updateUserName(chatMember);
  // }

  // async addChatMember(addChatMemberDto: AddChatMemberDto): Promise<ChatMember> {
  //   const chat = await this.chatRepo.findById(addChatMemberDto.chatId);
  //   const user = await this.chatUserRepo.chatUser(addChatMemberDto.chatId);
  //   if (!chat) {
  //     throw new NotFoundException('Chat not found');
  //   }
  //   return this.chatMemberRepo.addMember(chat, user);
  // }

  async removeChatMember(chat: Chat, user: ChatUser): Promise<void> {
    const member = await this.chatMemberRepo.findMember(chat, user);
    if (!member) {
      throw new NotFoundException('Member not found in this chat');
    }
    await this.chatMemberRepo.removeMember(chat, user);
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


  private getReceiverId(members: any[], userId: string): string {
    return members.find(member => member.userId !== userId)?.userId;
  }
}
