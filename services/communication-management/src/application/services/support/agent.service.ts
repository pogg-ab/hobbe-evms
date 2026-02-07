import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAgentRepository } from 'src/domain/repositories/support/agent.repository';
import {
  AgentResponseDto,
  CreateAgentDto,
  UpdateAgentDto,
  UpdateAgentAvailabilityDto,
} from 'src/presentation/dto/support/agent/agent.dto';
import { Agent } from 'src/domain/entities/support/agent.entity';
import { AGENT_REPOSITORY_TOKEN } from 'src/domain/repositories/support/agent.repository.token';
import { AgentFilterDto } from 'src/presentation/dto/support/agent/agent-filter.dto';

@Injectable()
export class AgentService {
  constructor(
    @Inject(AGENT_REPOSITORY_TOKEN)
    private readonly agentRepository: IAgentRepository,
  ) {}

  async createAgent(createAgentDto: CreateAgentDto): Promise<AgentResponseDto> {
    const agent: Agent = {
      id: 0,
      name: createAgentDto.name,
      email: createAgentDto.email,
      role: createAgentDto.role,
      available: createAgentDto.available,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const createdAgent = await this.agentRepository.create(agent);
    return this.mapToAgentResponseDto(createdAgent);
  }

  async findAllAgents(filters: AgentFilterDto): Promise<any[]> {
    const agents = await this.agentRepository.findWithFilters(filters);
    return agents;
  }

  async findAgentById(id: number): Promise<any> {
    const agent = await this.agentRepository.findOneById(id);
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }
    return agent;
  }

  async updateAgent(
    id: number,
    updateAgentDto: UpdateAgentDto,
  ): Promise<AgentResponseDto> {
    const agent = await this.agentRepository.update(id, {
      name: updateAgentDto.name,
      email: updateAgentDto.email,
      role: updateAgentDto.role,
      available: updateAgentDto.available,
    });
    return this.mapToAgentResponseDto(agent);
  }

  async deleteAgent(id: number): Promise<void> {
    await this.agentRepository.delete(id);
  }

  async updateAgentAvailability(
    id: number,
    updateAgentAvailabilityDto: UpdateAgentAvailabilityDto,
  ): Promise<AgentResponseDto> {
    const agent = await this.agentRepository.updateAvailability(
      id,
      updateAgentAvailabilityDto.available,
    );
    return this.mapToAgentResponseDto(agent);
  }

  private mapToAgentResponseDto(agent: Agent): AgentResponseDto {
    return {
      id: agent.id,
      name: agent.name,
      email: agent.email,
      role: agent.role,
      available: agent.available,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    };
  }
}
