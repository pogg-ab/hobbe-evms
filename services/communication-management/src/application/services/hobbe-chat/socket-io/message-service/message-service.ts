import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SendMessageCommand } from 'src/application/commands/hobbe-chat/send-message.command';
import { GetChatMessagesQuery } from 'src/application/queries/hobbe-chat/get-chat-messages-query';
import { Message } from 'src/domain/entities/hobbe-chat/message.entity';
import { CreateMessageDto } from 'src/presentation/dto/hobbe-chat/create-message.dto';

@Injectable()
export class MessageService {
      constructor(
         private readonly commandBus: CommandBus,
         private readonly queryBus: QueryBus) {}
    

     async sendMessage( user: any, createMessageDto : CreateMessageDto):Promise<any> {
         const message =  await this.commandBus.execute(new SendMessageCommand(user.user.user_id.toString(),createMessageDto));
         return message;
      }

     async getPrivateMessages( user: any,chatId: string,) :Promise<Message[]>{
        return this.queryBus.execute(new GetChatMessagesQuery(user.user.user_id.toString(),chatId));
      }
}
