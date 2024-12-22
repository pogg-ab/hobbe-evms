import { Tickets } from 'src/domain/entities/tickets.entity';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { EntityManager } from 'typeorm';

export interface ITicketsRepository {
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
  // findAllByEvent(ticket_heading_id:string, page:number, limit:number):Promise<{ticketsList:Tickets[] | null,total: number; page: number; limit: number}>
  findOne(id: string): Promise<Tickets | null>;
  // activate(id: string, status:string): Promise<Tickets|null>;
  getEventsAllTicketsList(
    ticket_heading_id: IdValueObject,
  ): Promise<Tickets[] | null>;
  findTicketsByStatusTypeAndPromocode(
    eventId: IdValueObject,
    type: string,
    status: string,
    hasPromocode: boolean,
  ): Promise<Tickets[] | null>;
  updateStatus(
    manager: EntityManager,
    id: IdValueObject,
    status: string,
  ): Promise<Tickets | null>;
}
