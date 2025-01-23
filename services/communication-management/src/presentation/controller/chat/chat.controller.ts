import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChatService } from '../../../application/services/chat/chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post(':room/send')
  async sendMessage(
    @Param('room') room: string,
    @Body() message: { sender: string; text: string },
  ) {
    await this.chatService.sendMessage(room, message);
    return { success: true };
  }

  @Get(':room/messages')
  async getMessages(@Param('room') room: string) {
    const messages = await this.chatService.getMessages(room);
    return { messages };
  }
}
