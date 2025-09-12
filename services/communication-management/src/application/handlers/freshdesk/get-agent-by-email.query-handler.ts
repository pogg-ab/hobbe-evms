import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AgentService } from 'src/application/services/freshdesk/agent.service';
import { GetAgentByEmailQuery } from 'src/application/queries/freshdesk/get-agent-by-email.query';
import { AgentResponseDto } from 'src/presentation/dto/freshdesk/agent/agent.dto';

@QueryHandler(GetAgentByEmailQuery)
export class GetAgentByEmailQueryHandler implements IQueryHandler<GetAgentByEmailQuery> {
    constructor(private readonly agentService: AgentService) { }

    async execute(query: GetAgentByEmailQuery): Promise<AgentResponseDto> {
        const { email } = query;
        return this.agentService.findAgentByEmail(email);
    }
}