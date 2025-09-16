import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListAgentsQuery } from 'src/application/queries/support/list-agents.query';
import { AgentService } from 'src/application/services/support/agent.service';
import { AgentResponseDto } from 'src/presentation/dto/support/agent/agent.dto';

@QueryHandler(ListAgentsQuery)
export class ListAgentsQueryHandler implements IQueryHandler<ListAgentsQuery> {
    constructor(private readonly agentService: AgentService) { }

    async execute(query: ListAgentsQuery): Promise<AgentResponseDto[]> {
        const { available } = query;
        return this.agentService.findAllAgents(available);
    }
}