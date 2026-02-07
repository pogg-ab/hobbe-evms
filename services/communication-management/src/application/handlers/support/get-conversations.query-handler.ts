import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetConversationsQuery } from 'src/application/queries/support/get-conversations.query';
import { ConversationService } from 'src/application/services/support/conversation.service';

@QueryHandler(GetConversationsQuery)
export class GetConversationsQueryHandler
  implements IQueryHandler<GetConversationsQuery>
{
  constructor(private readonly conversationService: ConversationService) {}

  async execute(query: GetConversationsQuery): Promise<any[]> {
    const { ticketId } = query;
    return this.conversationService.findConversationsByTicketId(ticketId);
  }
}
