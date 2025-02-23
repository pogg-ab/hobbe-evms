import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateChatCommand } from 'src/application/commands/hobbe-chat/create-chat.command';
import { ChatService } from 'src/application/services/hobbe-chat/chat.service';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create')
  async createChat(@Body() type: string, name?:string): Promise<Chat> {
    return this.chatService.createChat(type,name);
  }

  @Get(':chatId')
  async getChatById(@Param('chatId') chatId: string): Promise<Chat> {
    return this.chatService.getChatById(chatId);
  }

  @Get(':chatId/members')
  async getChatMembers(@Param('chatId') chatId: string): Promise<any[]> {
    return this.chatService.getChatMembers(chatId);
  }
}
