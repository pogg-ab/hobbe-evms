import { Agent } from "src/domain/entities/support/agent.entity";

export interface IAgentRepository {
    create(agent: Agent): Promise<Agent>;
    findAll(): Promise<Agent[]>;
    findOneById(id: number): Promise<Agent | null>;
    findByEmail(email: string): Promise<Agent | null>;
    update(id: number, agent: Partial<Agent>): Promise<Agent>;
    delete(id: number): Promise<void>;
    updateAvailability(id: number, available: boolean): Promise<Agent>;
    findByAvailability(available: boolean): Promise<Agent[]>;
}