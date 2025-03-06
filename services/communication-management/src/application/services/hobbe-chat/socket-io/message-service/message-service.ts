import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SendMessageCommand } from 'src/application/commands/hobbe-chat/send-message.command';
import { GetChatMessagesQuery } from 'src/application/queries/hobbe-chat/get-chat-messages-query';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';
import { Message } from 'src/domain/entities/hobbe-chat/message.entity';
import { ChatUserRepository } from 'src/domain/repositories/hobbe-chat/chat-user.repository';
import { CHAT_USER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-user.repository.token';
import { CreateMessageDto } from 'src/presentation/dto/hobbe-chat/create-message.dto';

@Injectable()
export class MessageService {
      constructor(
           @Inject(CHAT_USER_REPOSITORY_TOKEN)
             private readonly chatUserRepo: ChatUserRepository,
         private readonly commandBus: CommandBus,
         private readonly queryBus: QueryBus) {}
    

     async sendMessage( user: any, createMessageDto : CreateMessageDto):Promise<any> {
        const chatUser  = await this.chatUserRepo.chatUser(user.user.user_id.toString())
         const message =  await this.commandBus.execute(new SendMessageCommand(chatUser,createMessageDto));
         return message;
      }

     async getPrivateMessages( user: any,chat: Chat,) :Promise<Message[]>{
        return this.queryBus.execute(new GetChatMessagesQuery(user.user.user_id.toString(),chat));
      }
}
