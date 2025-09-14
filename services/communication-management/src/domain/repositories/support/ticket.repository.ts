import { Ticket } from "src/domain/entities/support/ticket.entity";
import { TicketResponseDto } from "src/presentation/dto/support/ticket/ticket.dto";

export interface ITicketRepository {
    create(ticket: Ticket): Promise<TicketResponseDto>;
    findAll(skip?: number, take?: number): Promise<Ticket[]>;
    findOneById(id: number): Promise<Ticket | null>;
    update(id: number, ticket: Partial<Ticket>): Promise<Ticket>;
    delete(id: number): Promise<void>;
    search(query: string): Promise<Ticket[]>;
    findByStatus(status: number): Promise<Ticket[]>;
    findByPriority(priority: number): Promise<Ticket[]>;
}