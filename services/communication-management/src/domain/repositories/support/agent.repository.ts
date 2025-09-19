import { Agent } from 'src/domain/entities/support/agent.entity';
import { AgentFilterDto } from 'src/presentation/dto/support/agent/agent-filter.dto';

export interface IAgentRepository {
  create(agent: Agent): Promise<Agent>;
  findOneById(id: number): Promise<any | null>;
  update(id: number, agent: Partial<Agent>): Promise<Agent>;
  delete(id: number): Promise<void>;
  updateAvailability(id: number, available: boolean): Promise<Agent>;
  findByAvailability(available: boolean): Promise<Agent[]>;
  findWithFilters(filters: AgentFilterDto): Promise<any[]>;
}
