import { AgentFilterDto } from 'src/presentation/dto/support/agent/agent-filter.dto';

export class ListAgentsQuery {
  constructor(public readonly filters: AgentFilterDto) {}
}
