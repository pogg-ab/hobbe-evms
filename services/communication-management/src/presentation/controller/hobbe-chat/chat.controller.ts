import { Controller, Post, Get, Param, Delete, Body, HttpCode, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { log } from 'console';
import { AddChatMemberCommand } from 'src/application/commands/hobbe-chat/add-chat-member.command';
import { CreateChatCommand } from 'src/application/commands/hobbe-chat/create-chat.command';
import { DeleteChatCommand } from 'src/application/commands/hobbe-chat/delete-chat-command';
import { GetUserChatsQuery } from 'src/application/queries/hobbe-chat/get-user-chat.query';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { AddChatMemberDto } from 'src/presentation/dto/hobbe-chat/add-chat-member.dto';
import { CreatePrivateChatDto } from 'src/presentation/dto/hobbe-chat/create-chat.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@Controller('chats')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  /**
   * Create a new chat (private or group)

  */
  @ApiBody({ type: CreatePrivateChatDto })
  @ApiOperation({ description: 'Create New Chat' })
  @HttpCode(200)
  @Post()
  async createChat(
    @Body() createPrivateChatDto: CreatePrivateChatDto,
    @CurrentUserId() user: any,  
  ) {    
   
    return this.commandBus.execute(new CreateChatCommand(user,createPrivateChatDto));
  }

  @ApiBody({ type: AddChatMemberDto })
  @ApiOperation({ description: 'Add New Chat Member' })
  @HttpCode(200)
  @Post('add-member')
  async addMember(@Body() addChatMemberDto: AddChatMemberDto) {
    return this.commandBus.execute(new AddChatMemberCommand(addChatMemberDto));
  }

  /**
   * Get all chats for a specific user
   */
  @Get()
  async getUserChats(@CurrentUserId() user: any) {
    return this.queryBus.execute(new GetUserChatsQuery(user.user.user_id.toString()));
  }
  

  /**
   * Soft delete a chat
   */
  @Delete(':chatId')
  async deleteChat(@Param('chatId') chatId: string) {
    return this.commandBus.execute(new DeleteChatCommand(chatId));
  }
}
