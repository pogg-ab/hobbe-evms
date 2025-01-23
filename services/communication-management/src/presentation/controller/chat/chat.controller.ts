import { Controller, Get, Post, Body, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ChatService } from '../../../application/services/chat/chat.service';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateChatDto } from 'src/presentation/dto/chat/create-chat.dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiBody({ type: CreateChatDto })
  @ApiOperation({ description: 'Create a new Chat' })
  @HttpCode(200)
  @ApiResponse({
    type: CreateChatDto,
  })
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':room/send')
  async sendMessage(
    @Param('room') room: string,
    @Body() message:{text:string} ,
    @CurrentUserId() user: any,
  ) {
    const messageMetaData = { sender: user.user.user_id.toString(),  message };
    await this.chatService.sendMessage(room, messageMetaData);
    return { success: true };
  }

  @Get(':room/messages')
  async getMessages(@Param('room') room: string) {
    const messages = await this.chatService.getMessages(room);
    return { messages };
  }
}
