import { TicketGifts } from 'src/domain/entities/ticket-gifts.entity';

export interface ITicketGiftsRepository {
  create(
    user: any,
    bookingId: any,
    recipientId: any,
    gifterId: any,
  ): Promise<void>;
  findByBookingId(bookingId: string): Promise<TicketGifts | null>;
  delete(giftId: string): Promise<void>;
}
