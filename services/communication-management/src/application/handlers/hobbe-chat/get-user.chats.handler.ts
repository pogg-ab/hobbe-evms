import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserChatsQuery } from 'src/application/queries/hobbe-chat/get-user-chat.query';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';
import { ChatRepository } from 'src/domain/repositories/hobbe-chat/chat.repository';
import { CHAT_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat.repository.token';


@QueryHandler(GetUserChatsQuery)
export class GetUserChatsHandler implements IQueryHandler<GetUserChatsQuery> {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN)
    private readonly chatRepo: ChatRepository
  ) {}

  async execute(query: GetUserChatsQuery): Promise<Chat[]> {
    return this.chatRepo.getUserChats(query.userId);
  }
}
