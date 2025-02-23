import { Controller, Post, Get, Param, Delete, Body, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { CreateChatCommand } from 'src/application/commands/hobbe-chat/create-chat.command';
import { DeleteChatCommand } from 'src/application/commands/hobbe-chat/delete-chat-command';
import { GetUserChatsQuery } from 'src/application/queries/hobbe-chat/get-user-chat.query';

@Controller('chats')
export class ChatController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  /**
   * Create a new chat (private or group)

  */
  // @ApiBody({ type: createC })
  @ApiOperation({ description: 'Add New Chat' })
  @HttpCode(200)
  @Post()
  async createChat(@Body() body: { userId: string; friendId?: string; type: string; name?: string }) {
    return this.commandBus.execute(new CreateChatCommand(body.userId, body.friendId, body.type, body.name));
  }

  /**
   * Get all chats for a specific user
   */
  @Get('user/:userId')
  async getUserChats(@Param('userId') userId: string) {
    return this.queryBus.execute(new GetUserChatsQuery(userId));
  }

  /**
   * Soft delete a chat
   */
  @Delete(':chatId')
  async deleteChat(@Param('chatId') chatId: string) {
    return this.commandBus.execute(new DeleteChatCommand(chatId));
  }
}
