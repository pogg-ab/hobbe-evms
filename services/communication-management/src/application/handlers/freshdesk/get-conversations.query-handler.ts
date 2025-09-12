import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetConversationsQuery } from 'src/application/queries/freshdesk/get-conversations.query';
import { ConversationService } from 'src/application/services/freshdesk/conversation.service';
import { ConversationResponseDto } from 'src/presentation/dto/freshdesk/conversation/conversation.dto';

@QueryHandler(GetConversationsQuery)
export class GetConversationsQueryHandler implements IQueryHandler<GetConversationsQuery> {
    constructor(private readonly conversationService: ConversationService) { }

    async execute(query: GetConversationsQuery): Promise<ConversationResponseDto[]> {
        const { ticketId } = query;
        return this.conversationService.findConversationsByTicketId(ticketId);
    }
}