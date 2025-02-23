import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetChatMessagesQuery } from 'src/application/queries/hobbe-chat/get-chat-messages-query';
import { Message } from 'src/domain/entities/hobbe-chat/message.entity';
import { MessageRepository } from 'src/domain/repositories/hobbe-chat/message.repository';
import { MESSAGE_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/message.repository.token copy';

@QueryHandler(GetChatMessagesQuery)
export class GetChatMessagesHandler implements IQueryHandler<GetChatMessagesQuery> {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)

    private readonly messageRepo: MessageRepository
  ) {}

  async execute(query: GetChatMessagesQuery): Promise<Message[]> {
    return this.messageRepo.getChatMessages(query.chatId);
  }
}
