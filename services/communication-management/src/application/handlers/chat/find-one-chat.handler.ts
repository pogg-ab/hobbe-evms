import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindOneChatQuery } from "src/application/queries/chat/find-one.-chat.query";
import { ChatService } from "src/application/services/chat/chat.service";

@QueryHandler(FindOneChatQuery)

export class FindOneQueryHandler implements IQueryHandler<FindOneChatQuery>{
    constructor(
        private readonly chatService:ChatService
    ){}
    execute(query: FindOneChatQuery): Promise<any> {
        const {user, friend,chat_id} = query;
        return this.chatService.findOne(user,friend,chat_id);
    }
    
}