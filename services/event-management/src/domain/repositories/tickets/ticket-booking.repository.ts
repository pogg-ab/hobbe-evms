import { Tickets } from 'src/domain/entities/tickets.entity';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';

export interface ITicketBookingRepository {
  create(createTicketsDto: CreateTicketsDto): Promise<void>;
  findAll(
    page: number,
    limit: number,
  ): Promise<{
    tickets: Tickets[] | null;
    total: number;
    page: number;
    limit: number;
  }>;
  findAllByTicketsHeading(
    ticket_heading_id: string,
    tickets_type?: string,
    status?: string,
  ): Promise<{ tickets: Tickets[] | null }>;
  findOne(id: string): Promise<Tickets | null>;
  getEventsAllTicketsList(
    ticket_heading_id: IdValueObject,
  ): Promise<Tickets[] | null>;
}
