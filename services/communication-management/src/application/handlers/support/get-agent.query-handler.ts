import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAgentQuery } from 'src/application/queries/support/get-agent.query';
import { AgentService } from 'src/application/services/support/agent.service';
import { AgentResponseDto } from 'src/presentation/dto/support/agent/agent.dto';
@QueryHandler(GetAgentQuery)
export class GetAgentQueryHandler implements IQueryHandler<GetAgentQuery> {
    constructor(private readonly agentService: AgentService) { }

    async execute(query: GetAgentQuery): Promise<AgentResponseDto> {
        const { id } = query;
        return this.agentService.findAgentById(id);
    }
}