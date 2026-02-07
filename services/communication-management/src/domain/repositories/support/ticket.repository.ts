import { FileStream } from 'src/application/commands/support/create-ticket.command';
import { Ticket } from 'src/domain/entities/support/ticket.entity';
import { TicketResponseDto } from 'src/presentation/dto/support/ticket/ticket.dto';

export interface ITicketRepository {
  create(
    ticket: Partial<Ticket> & { attachments?: FileStream[] },
  ): Promise<TicketResponseDto>;
  findAll(skip?: number, take?: number): Promise<Ticket[]>;
  findOneById(id: number): Promise<any>;
  update(id: number, ticket: Partial<Ticket>): Promise<Ticket>;
  delete(id: number): Promise<void>;
  search(query: string, page?: number): Promise<any[]>;
  findByStatus(status: number): Promise<Ticket[]>;
  findByPriority(priority: number): Promise<Ticket[]>;
}
