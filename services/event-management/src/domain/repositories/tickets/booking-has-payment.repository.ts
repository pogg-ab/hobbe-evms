import { BookingHasPayment } from 'src/domain/entities/booking-has-payment.entity';

export interface IBookingHasPaymentRepository {
  create(
    paymentMethod: string,
    totalAmount: number,
    status: string,
    bookingId: string,
  ): Promise<BookingHasPayment>;
  findByBookingId(bookingId: string): Promise<BookingHasPayment | null>;
  update(
    id: string,
    paymentMethod: string,
    totalAmount: number,
    status: string,
  ): Promise<BookingHasPayment>;
  delete(id: string): Promise<void>;
}
