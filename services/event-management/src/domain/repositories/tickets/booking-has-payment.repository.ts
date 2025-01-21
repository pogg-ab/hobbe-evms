import { BookingHasPayment } from 'src/domain/entities/booking-has-payment.entity';
import { EntityManager } from 'typeorm';

export interface IBookingHasPaymentRepository {
  create(
    manager: EntityManager,
    bookingId: string,
    paymentMethod: string,
    totalAmount: number,
    user: any,
  ): Promise<void>;

  findByBookingId(bookingId: string): Promise<BookingHasPayment | null>;

  findOneById(bookingHasPaymentId: string): Promise<BookingHasPayment | null>;

  update(
    manager: EntityManager,
    bookingHasPaymentId: string,
    paymentMethod: string,
    totalAmount: number,
    status: 'pending' | 'paid' | 'failed',
    user: any,
  ): Promise<void>;

  delete(bookingHasPaymentId: string): Promise<void>;
}
