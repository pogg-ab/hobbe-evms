import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { CreateTicketBookingDto } from 'src/presentation/dtos/tickets/create-ticket-booking.dto';

export interface ITicketBookingRepository {
  create(createTicketBookingDto: CreateTicketBookingDto): Promise<void>;
  findAll(
    page: number,
    limit: number,
  ): Promise<{
    ticketBookings: TicketBooking[] | null;
    total: number;
    page: number;
    limit: number;
  }>;
  findOne(id: string): Promise<TicketBooking | null>;
  update(
    id: string,
    updatedTicketBooking: TicketBooking,
    user: any,
  ): Promise<TicketBooking>;
  delete(id: string): Promise<void>;
  findAllByEvent(event_id: string): Promise<TicketBooking[] | null>;
  findAllByTicketBuyer(
    ticket_buyer_id: string,
  ): Promise<TicketBooking[] | null>;
  findAllByEventOrganizer(
    event_organizer_id: string,
  ): Promise<TicketBooking[] | null>;
}
