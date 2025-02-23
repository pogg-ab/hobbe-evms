import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMessagesQuery } from 'src/application/queries/hobbe-chat/get-messages.query';
import { MessageRepository } from 'src/domain/repositories/hobbe-chat/message.repository';


@QueryHandler(GetMessagesQuery)
export class GetMessagesHandler implements IQueryHandler<GetMessagesQuery> {
  constructor(private readonly messageRepo: MessageRepository) {}

  async execute(query: GetMessagesQuery) {
    return this.messageRepo.getChatMessages(query.chatId);
  }
}
