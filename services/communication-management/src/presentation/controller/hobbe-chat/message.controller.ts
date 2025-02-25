import { Controller, Post, Get, Delete, Param, Body, UseGuards, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { DeleteMessageCommand } from 'src/application/commands/hobbe-chat/delete-message.command';
import { SendMessageCommand } from 'src/application/commands/hobbe-chat/send-message.command';
import { GetChatMessagesQuery } from 'src/application/queries/hobbe-chat/get-chat-messages-query';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { CreateChatDto } from 'src/presentation/dto/hobbe-chat/create-chat.dto';
import { CreateMessageDto } from 'src/presentation/dto/hobbe-chat/create-message.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';

@Controller('messages')
@Controller('chats')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  /**
   * Send a message to a chat
   */
  @Post()
  @ApiBody({ type: CreateMessageDto })
  @ApiOperation({ description: 'Send New Message' })
  @HttpCode(200)
  async sendMessage(
    @CurrentUserId() user: any,  
    @Body() createMessageDto : CreateMessageDto) {
      
    return this.commandBus.execute(new SendMessageCommand(user.user.user_id.toString(),createMessageDto));
  }

  /**
   * Get all messages in a chat
   */
  @Get(':chatId')
  async getMessages(
    @Param('chatId') chatId: string,
    @CurrentUserId() user: any,  
  ) {
    return this.queryBus.execute(new GetChatMessagesQuery(user.user.user_id.toString(),chatId));
  }

  /**
   * Soft delete a message
   */
  @Delete(':messageId')
  async deleteMessage(@Param('messageId') messageId: string) {
    return this.commandBus.execute(new DeleteMessageCommand(messageId));
  }
}
