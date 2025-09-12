import { Ticket } from "src/domain/entities/freshdesk/ticket.entity";

export interface ITicketRepository {
    create(ticket: Ticket): Promise<Ticket>;
    findAll(skip?: number, take?: number): Promise<Ticket[]>;
    findOneById(id: number): Promise<Ticket | null>;
    update(id: number, ticket: Partial<Ticket>): Promise<Ticket>;
    delete(id: number): Promise<void>;
    search(query: string): Promise<Ticket[]>;
    findByStatus(status: number): Promise<Ticket[]>;
    findByPriority(priority: number): Promise<Ticket[]>;
}