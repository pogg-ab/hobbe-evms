import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindChatByIdQuery } from "src/application/queries/hobbe-chat/find-one-chat.query";
import { ChatService } from "src/application/services/hobbe-chat/chat.service";

@QueryHandler(FindChatByIdQuery)
export class FindChatByIdQueryHandler implements IQueryHandler<FindChatByIdQuery> {
    constructor(
        private readonly chatService: ChatService, // Replace with actual service type
    ) {}
  async execute(query: FindChatByIdQuery): Promise<any> {
    return this.chatService.getChatById(query.userId,query.chatId);
  }
}