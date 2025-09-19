import { Injectable, NotFoundException } from '@nestjs/common';
import { Agent } from 'src/domain/entities/support/agent.entity';
import { IAgentRepository } from 'src/domain/repositories/support/agent.repository';
import { FreshdeskConfigService } from 'src/infrastructure/support/freshdesk.config';
import axios from 'axios';
import { AgentFilterDto } from 'src/presentation/dto/support/agent/agent-filter.dto';

@Injectable()
export class AgentRepositoryImpl implements IAgentRepository {
  constructor(private readonly configService: FreshdeskConfigService) {}

  async create(agent: Agent): Promise<Agent> {
    const response = await axios.post(
      `${this.configService.baseUrl}/agents`,
      agent,
      { headers: this.configService.authHeader },
    );
    return response.data as Agent;
  }

  async findOneById(id: number): Promise<any | null> {
    try {
      const response = await axios.get(
        `${this.configService.baseUrl}/agents/${id}`,
        { headers: this.configService.authHeader },
      );
      return response.data as Agent;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async findWithFilters(filters: AgentFilterDto): Promise<any[]> {
    const params = new URLSearchParams();

    if (filters.email) params.append('email', filters.email);
    if (filters.mobile) params.append('mobile', filters.mobile);
    if (filters.phone) params.append('phone', filters.phone);
    if (filters.state) params.append('state', filters.state);

    const url = `${this.configService.baseUrl}/agents?${params.toString()}`;

    try {
      const response = await axios.get(url, {
        headers: this.configService.authHeader,
      });

      return response.data as Agent[];
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Agent | null> {
    try {
      const response = await axios.get(
        `${this.configService.baseUrl}/agents?email=${encodeURIComponent(email)}`,
        { headers: this.configService.authHeader },
      );
      return response.data.length > 0 ? (response.data[0] as Agent) : null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async update(id: number, agent: Partial<Agent>): Promise<Agent> {
    try {
      const response = await axios.put(
        `${this.configService.baseUrl}/agents/${id}`,
        agent,
        { headers: this.configService.authHeader },
      );
      return response.data as Agent;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Agent with ID ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`${this.configService.baseUrl}/agents/${id}`, {
        headers: this.configService.authHeader,
      });
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Agent with ID ${id} not found`);
      }
      throw error;
    }
  }

  async updateAvailability(id: number, available: boolean): Promise<Agent> {
    try {
      const response = await axios.put(
        `${this.configService.baseUrl}/agents/${id}`,
        { available },
        { headers: this.configService.authHeader },
      );
      return response.data as Agent;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Agent with ID ${id} not found`);
      }
      throw error;
    }
  }

  async findByAvailability(available: boolean): Promise<Agent[]> {
    const response = await axios.get(
      `${this.configService.baseUrl}/agents?available=${available}`,
      { headers: this.configService.authHeader },
    );
    return response.data as Agent[];
  }
}
