import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAgentQuery } from 'src/application/queries/freshdesk/get-agent.query';
import { AgentService } from 'src/application/services/freshdesk/agent.service';
import { AgentResponseDto } from 'src/presentation/dto/freshdesk/agent/agent.dto';
@QueryHandler(GetAgentQuery)
export class GetAgentQueryHandler implements IQueryHandler<GetAgentQuery> {
    constructor(private readonly agentService: AgentService) { }

    async execute(query: GetAgentQuery): Promise<AgentResponseDto> {
        const { id } = query;
        return this.agentService.findAgentById(id);
    }
}