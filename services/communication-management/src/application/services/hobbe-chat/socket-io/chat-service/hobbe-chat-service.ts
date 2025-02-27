import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserChatsQuery } from 'src/application/queries/hobbe-chat/get-user-chat.query';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';

@Injectable()
export class HobbeChatService {
  constructor(
    private readonly commandBus: CommandBus, 
    private readonly queryBus: QueryBus) {}

  async getUserChats( user: string) {
    return this.queryBus.execute(new GetUserChatsQuery(user));
  }
  
}
