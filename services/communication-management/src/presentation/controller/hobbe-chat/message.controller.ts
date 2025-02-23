import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DeleteMessageCommand } from 'src/application/commands/hobbe-chat/delete-message.command';
import { SendMessageCommand } from 'src/application/commands/hobbe-chat/send-message.command';
import { GetChatMessagesQuery } from 'src/application/queries/hobbe-chat/get-chat-messages-query';

@Controller('messages')
export class MessageController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  /**
   * Send a message to a chat
   */
  @Post()
  async sendMessage(@Body() body: { chatId: string; senderId: string; content: string }) {
    return this.commandBus.execute(new SendMessageCommand(body.chatId, body.senderId, body.content));
  }

  /**
   * Get all messages in a chat
   */
  @Get(':chatId')
  async getMessages(@Param('chatId') chatId: string) {
    return this.queryBus.execute(new GetChatMessagesQuery(chatId));
  }

  /**
   * Soft delete a message
   */
  @Delete(':messageId')
  async deleteMessage(@Param('messageId') messageId: string) {
    return this.commandBus.execute(new DeleteMessageCommand(messageId));
  }
}
