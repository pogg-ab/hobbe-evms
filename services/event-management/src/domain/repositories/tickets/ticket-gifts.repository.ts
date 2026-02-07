import { TicketGifts } from 'src/domain/entities/ticket-gifts.entity';
import { EntityManager } from 'typeorm';

export interface ITicketGiftsRepository {
  create(
    manager: EntityManager,
    user: any,
    bookingId: any,
    recipientId: any,
    gifterId: any,
    ticketCount: number,
  ): Promise<void>;
  findByBookingId(
    manager: EntityManager,
    bookingId: string,
  ): Promise<TicketGifts | null>;
  findByBookingIdAndRecipient(
    manager: EntityManager,
    bookingId: string,
    recipientId: string,
  ): Promise<TicketGifts | null>;

  delete(giftId: string): Promise<void>;
}
