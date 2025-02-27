import { Controller, Post, Body, Get, Param, HttpCode, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { CreateChatCommand } from 'src/application/commands/hobbe-chat/create-chat.command';
import { ChatService } from 'src/application/services/hobbe-chat/chat.service';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { CreatePrivateChatDto } from 'src/presentation/dto/hobbe-chat/create-chat.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@Controller('chats')
@Controller('chats')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly commandBus: CommandBus, 
    private readonly queryBus: QueryBus
    

  ) {}
 @ApiBody({ type: CreatePrivateChatDto })
  @ApiOperation({ description: 'Create New Chat' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Post()
  @Post('create')


  async createChat(
    @Body() createPrivateChatDto:CreatePrivateChatDto,
    @CurrentUserId() user: any,  
   ) {
     return this.commandBus.execute(new CreateChatCommand(user,createPrivateChatDto));
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
