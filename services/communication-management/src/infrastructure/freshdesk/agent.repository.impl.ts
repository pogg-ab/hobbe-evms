import { Injectable, NotFoundException } from '@nestjs/common';
import { Agent } from 'src/domain/entities/freshdesk/agent.entity';
import { IAgentRepository } from 'src/domain/repositories/freshdesk/agent.repository';
import { FreshdeskConfigService } from 'src/infrastructure/freshdesk/freshdesk.config';
import axios from 'axios';

@Injectable()
export class AgentRepositoryImpl implements IAgentRepository {
    constructor(private readonly configService: FreshdeskConfigService) { }

    async create(agent: Agent): Promise<Agent> {
        const response = await axios.post(
            `${this.configService.baseUrl}/agents`,
            agent,
            { headers: this.configService.authHeader }
        );
        return response.data as Agent;
    }

    async findAll(): Promise<Agent[]> {
        const response = await axios.get(
            `${this.configService.baseUrl}/agents`,
            { headers: this.configService.authHeader }
        );
        return response.data as Agent[];
    }

    async findOneById(id: number): Promise<Agent | null> {
        try {
            const response = await axios.get(
                `${this.configService.baseUrl}/agents/${id}`,
                { headers: this.configService.authHeader }
            );
            return response.data as Agent;
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    async findByEmail(email: string): Promise<Agent | null> {
        try {
            const response = await axios.get(
                `${this.configService.baseUrl}/agents?email=${encodeURIComponent(email)}`,
                { headers: this.configService.authHeader }
            );
            return response.data.length > 0 ? response.data[0] as Agent : null;
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
                { headers: this.configService.authHeader }
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
            await axios.delete(
                `${this.configService.baseUrl}/agents/${id}`,
                { headers: this.configService.authHeader }
            );
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
                { headers: this.configService.authHeader }
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
            { headers: this.configService.authHeader }
        );
        return response.data as Agent[];
    }
}