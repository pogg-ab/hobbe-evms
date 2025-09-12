import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetConversationQuery } from 'src/application/queries/freshdesk/get-conversation.query';
import { ConversationService } from 'src/application/services/freshdesk/conversation.service';
import { ConversationResponseDto } from 'src/presentation/dto/freshdesk/conversation/conversation.dto';

@QueryHandler(GetConversationQuery)
export class GetConversationQueryHandler implements IQueryHandler<GetConversationQuery> {
    constructor(private readonly conversationService: ConversationService) { }

    async execute(query: GetConversationQuery): Promise<ConversationResponseDto> {
        const { id } = query;
        return this.conversationService.findConversationById(id);
    }
}