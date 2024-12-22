import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingHasPayment } from 'src/domain/entities/booking-has-payment.entity';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { IBookingHasPaymentRepository } from 'src/domain/repositories/tickets/booking-has-payment.repository';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class BookingHasPaymentRepositoryImpl
  implements IBookingHasPaymentRepository
{
  constructor(
    @InjectRepository(BookingHasPayment)
    private bookingHasPaymentRepository: Repository<BookingHasPayment>,
    @InjectRepository(TicketBooking)
    private ticketBookingRepository: Repository<TicketBooking>,
  ) {}

  async create(
    manager: EntityManager,
    bookingId: string,
    paymentMethod: string,
    totalAmount: number,
    user: any,
  ): Promise<void> {
    try {
      const ticketBooking = await manager.findOne(TicketBooking, {
        where: { booking_id: bookingId },
      });
      console.log(ticketBooking);

      if (!ticketBooking) {
        throw new HttpException(
          'TicketBooking not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const newBookingHasPayment = this.bookingHasPaymentRepository.create({
        booking_id: ticketBooking,
        payment_method: paymentMethod,
        total_amount: totalAmount,
      });

      newBookingHasPayment.created_by = user;
      newBookingHasPayment.updated_by = user;
      newBookingHasPayment.created_at = new Date();
      newBookingHasPayment.updated_at = new Date();

      await manager.save(newBookingHasPayment);
    } catch (error) {
      throw new HttpException(
        `Error creating Booking Has Payment: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByBookingId(bookingId: string): Promise<BookingHasPayment | null> {
    try {
      return await this.bookingHasPaymentRepository.findOne({
        where: { booking_id: { booking_id: bookingId } },
      });
    } catch (error) {
      throw new HttpException(
        `Error fetching Booking Has Payment for Booking ID ${bookingId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneById(
    bookingHasPaymentId: string,
  ): Promise<BookingHasPayment | null> {
    try {
      return await this.bookingHasPaymentRepository.findOne({
        where: { booking_has_payment_id: bookingHasPaymentId },
      });
    } catch (error) {
      throw new HttpException(
        `Error fetching Booking Has Payment with ID ${bookingHasPaymentId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    manager: EntityManager,
    bookingHasPaymentId: string,
    paymentMethod: string,
    totalAmount: number,
    status: 'pending' | 'paid' | 'failed',
    user: any,
  ): Promise<void> {
    try {
      const bookingHasPayment = await manager.findOne(BookingHasPayment, {
        where: { booking_has_payment_id: bookingHasPaymentId },
      });

      if (!bookingHasPayment) {
        throw new HttpException(
          `Booking Has Payment with ID ${bookingHasPaymentId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      bookingHasPayment.payment_method = paymentMethod;
      bookingHasPayment.total_amount = totalAmount;
      bookingHasPayment.status = status;
      bookingHasPayment.updated_by = user;
      bookingHasPayment.updated_at = new Date();

      await manager.save(bookingHasPayment);
    } catch (error) {
      throw new HttpException(
        `Error updating Booking Has Payment with ID ${bookingHasPaymentId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(bookingHasPaymentId: string): Promise<void> {
    try {
      const bookingHasPayment = await this.bookingHasPaymentRepository.findOne({
        where: { booking_has_payment_id: bookingHasPaymentId },
      });

      if (!bookingHasPayment) {
        throw new HttpException(
          `Booking Has Payment with ID ${bookingHasPaymentId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.bookingHasPaymentRepository.remove(bookingHasPayment);
    } catch (error) {
      throw new HttpException(
        `Error deleting Booking Has Payment with ID ${bookingHasPaymentId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
