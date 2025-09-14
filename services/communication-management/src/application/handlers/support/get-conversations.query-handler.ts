import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetConversationsQuery } from 'src/application/queries/support/get-conversations.query';
import { ConversationService } from 'src/application/services/support/conversation.service';
import { ConversationResponseDto } from 'src/presentation/dto/support/conversation/conversation.dto';

@QueryHandler(GetConversationsQuery)
export class GetConversationsQueryHandler implements IQueryHandler<GetConversationsQuery> {
    constructor(private readonly conversationService: ConversationService) { }

    async execute(query: GetConversationsQuery): Promise<ConversationResponseDto[]> {
        const { ticketId } = query;
        return this.conversationService.findConversationsByTicketId(ticketId);
    }
}