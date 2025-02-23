import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DeleteMessageCommand } from 'src/application/commands/hobbe-chat/delete-message.command';
import { SendMessageCommand } from 'src/application/commands/hobbe-chat/send-message.command';
import { GetChatMessagesQuery } from 'src/application/queries/hobbe-chat/get-chat-messages-query';

@Injectable()
export class MessageService {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  async sendMessage(chatId: string, senderId: string, content: string) {
    return this.commandBus.execute(new SendMessageCommand(chatId, senderId, content));
  }

  async deleteMessage(messageId: string) {
    return this.commandBus.execute(new DeleteMessageCommand(messageId));
  }

  async getChatMessages(chatId: string) {
    return this.queryBus.execute(new GetChatMessagesQuery(chatId));
  }
}
