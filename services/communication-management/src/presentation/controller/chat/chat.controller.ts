import { Controller, Get, Post, Body, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ChatService } from '../../../application/services/chat/chat.service';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateChatDto } from 'src/presentation/dto/chat/create-chat.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateChatCommand } from 'src/application/commands/chat/create-chat.command';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly commandBus:CommandBus,
    private readonly queryBus:QueryBus,
    private readonly chatService: ChatService,
  ) {}

  @ApiBody({ type: CreateChatDto })
  @ApiOperation({ description: 'Create a new Chat' })
  @HttpCode(200)
  @ApiResponse({
    type: CreateChatDto,
  })
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('send')
  async sendMessage(
    @Body() createChatDto:CreateChatDto ,
    @CurrentUserId() user: any,
  ):Promise<{message:string}> {
    
    await this.commandBus.execute(new CreateChatCommand(user.user.user_id.toString(),createChatDto));
    return  {message:"Sent message successfully !"}
  }

  @Get(':room/messages')
  async getMessages(@Param('room') room: string) {
    const messages = await this.chatService.getMessages(room);
    return { messages };
  }
}
