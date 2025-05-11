import { BookingHasPromocode } from 'src/domain/entities/booking-has-promocode.entity';
import { EntityManager } from 'typeorm';

export interface IBookingHasPromocodeRepository {
  create(
    manager: EntityManager,
    bookingId: string,
    promocodeId: string,
    user: any,
  ): Promise<void>;

  findByBookingId(bookingId: string): Promise<BookingHasPromocode[] | null>;

  findOneById(
    bookingHasPromocodeId: string,
  ): Promise<BookingHasPromocode | null>;

  update(
    manager: EntityManager,
    bookingHasPromocodeId: string,
    promocodeId: string,
    user: any,
  ): Promise<void>;

  delete(bookingHasPromocodeId: string): Promise<void>;

  findByPromocode(promocodeId: any): Promise<string[]>;
  countTicketsForBooking(bookingId: string[]): Promise<number>;
}
