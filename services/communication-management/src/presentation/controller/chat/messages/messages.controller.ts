import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { MessageService } from 'src/application/services/chat/message-service/message-service';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@Controller('messages')
export class MessagesController {
  constructor(private messageService: MessageService) {}

  @ApiOperation({ description: 'Create a new Messages' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('send')
  async createMessage(
    @Body() message: { chatId: string; messageData: any },
  ) {
    await this.messageService.sendMessage(
      message.chatId,
      // message.messageId,
      message,
    );
    return { chat: 'Message sent successfully' };
  }

  @ApiOperation({ description: 'Get All Messages' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':chatId')
  async getMessages(@Param('chatId') chatId: string) {
    const messages = await this.messageService.getMessages(chatId);
    return messages ? messages : { message: 'No messages found for this chat' };
  }
}
