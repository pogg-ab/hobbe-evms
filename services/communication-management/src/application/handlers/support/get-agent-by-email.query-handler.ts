import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AgentService } from 'src/application/services/support/agent.service';
import { GetAgentByEmailQuery } from 'src/application/queries/support/get-agent-by-email.query';
import { AgentResponseDto } from 'src/presentation/dto/support/agent/agent.dto';

@QueryHandler(GetAgentByEmailQuery)
export class GetAgentByEmailQueryHandler implements IQueryHandler<GetAgentByEmailQuery> {
    constructor(private readonly agentService: AgentService) { }

    async execute(query: GetAgentByEmailQuery): Promise<AgentResponseDto> {
        const { email } = query;
        return this.agentService.findAgentByEmail(email);
    }
}