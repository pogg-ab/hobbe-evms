import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { use } from 'passport';
import { ChatsService } from 'src/application/services/chat/chat-service/chats.service';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@Controller('chats')
export class ChatsController {
  constructor(private chatService: ChatsService) {}

  @ApiOperation({ description: 'Create a new Chat' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('add-friend/:userId')
  async createchat(
    @CurrentUserId() user: any,
    @Param('userId') userId: string,
  ) {
    const loggedInUser =  user.user.user_id.toString()
    const member = {[`${loggedInUser}`] : true, [`${userId}`]:true}
    const chat ={ members: {
      member
      },
      "lastMessage": {
        "senderId": user.user.user_id.toString(),
        "text": `${user.user.user_name} Joined Hobbe Chat.`,
        "timestamp":  Date.now()
      }
    }
    await this.chatService.createChat(user.user.user_id.toString(), chat);
    return { chat: 'Chat created successfully' };
  }

  @Get(':chatId')
  async getChat(@Param('chatId') chatId: string) {
    const chat = await this.chatService.getChat(chatId);
    return chat ? chat : { message: 'No chat found for this ID' };
  }
}
