import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { SendMessageCommand } from 'src/application/commands/messages/send-message.command';
import { GetConversationQuery } from 'src/application/queries/messages/get-conversation.query';


@Controller('messages')
export class MessagesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post()
  async sendMessage(
    @Body('senderId') senderId: number,
    @Body('receiverId') receiverId: number,
    @Body('content') content: string,
  ) {
    const message = await this.commandBus.execute(
      new SendMessageCommand(senderId, receiverId, content),
    );
    return message
  }

  @Get('conversation')
  async getConversation(
    @Query('userId1') userId1: number,
    @Query('userId2') userId2: number,
  ) {
    const messages = await this.queryBus.execute(
      new GetConversationQuery(userId1, userId2),
    );
    return messages;
  }
}