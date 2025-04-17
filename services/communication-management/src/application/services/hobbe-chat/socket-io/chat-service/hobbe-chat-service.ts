import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateChatCommand } from 'src/application/commands/hobbe-chat/create-chat.command';
import { FindChatByIdQuery } from 'src/application/queries/hobbe-chat/find-one-chat.query';
import { GetUserChatsQuery } from 'src/application/queries/hobbe-chat/get-user-chat.query';
import { CreatePrivateChatDto } from 'src/presentation/dto/hobbe-chat/create-chat.dto';

@Injectable()
export class HobbeChatService {
  constructor(
    private readonly commandBus: CommandBus, 
    private readonly queryBus: QueryBus) {}

  async getUserChats( user: string) {
    return await this.queryBus.execute(new GetUserChatsQuery(user));
  }
  
  async createChat(user:any, createPrivateChatDto: CreatePrivateChatDto) {    
    return this.commandBus.execute(new CreateChatCommand(user,createPrivateChatDto));
  }

  async getChatConvesation(user:any, chatId: {chatId:string}) {        
    return  await this.queryBus.execute(new FindChatByIdQuery( user.user?.user_id?.toString(),
      chatId.chatId.toString()));  
  }
  
}
