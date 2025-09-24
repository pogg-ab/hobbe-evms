import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { CreateTicketBookingDto } from 'src/presentation/dtos/tickets/create-ticket-booking.dto';
import { EntityManager } from 'typeorm';

export interface ITicketBookingRepository {
  create(
    manager: EntityManager,
    createTicketBookingDto: CreateTicketBookingDto,
    user: any,
  ): Promise<TicketBooking>;
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

  getMyTicketBooking(userId: string): Promise<TicketBooking[] | null>;

  
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
  ): Promise<{ event: Event; ticketBookings: TicketBooking[] }[] | null>;


  updateStatus(
    id: string,
    booking_status: string,
    update_at: any,
  ): Promise<TicketBooking>;
  findUserIdsByEventId(eventId: string): Promise<string[]>;


  processRefund(bookingId: string): Promise<void>;
}
