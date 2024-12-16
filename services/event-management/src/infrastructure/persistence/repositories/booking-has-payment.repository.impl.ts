import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingHasPayment } from 'src/domain/entities/booking-has-payment.entity';
import { IBookingHasPaymentRepository } from 'src/domain/repositories/tickets/booking-has-payment.repository';
import { CreateBookingHasPaymentDto } from 'src/presentation/dtos/tickets/create-booking-has-payment.dto';
import { UpdateBookingHasPaymentDto } from 'src/presentation/dtos/tickets/update-booking-has-payment.dto';
import { Repository } from 'typeorm';

@Injectable()
export class BookingHasPaymentRepositoryImpl
  implements IBookingHasPaymentRepository
{
  constructor(
    @InjectRepository(BookingHasPayment)
    private readonly bookingHasPaymentRepository: Repository<BookingHasPayment>,
  ) {}

  async create(
    createBookingHasPaymentDto: CreateBookingHasPaymentDto,
  ): Promise<BookingHasPayment> {
    try {
      const newBookingHasPayment = this.bookingHasPaymentRepository.create(
        createBookingHasPaymentDto,
      );
      return await this.bookingHasPaymentRepository.save(newBookingHasPayment);
    } catch (error) {
      throw new HttpException(
        `Error creating Booking Has Payment: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<BookingHasPayment | null> {
    try {
      const bookingHasPayment = await this.bookingHasPaymentRepository.findOne({
        where: { booking_has_payment_id: id },
      });
      if (!bookingHasPayment) {
        throw new HttpException(
          `Booking Has Payment with ID ${id} not found.`,
          HttpStatus.NOT_FOUND,
        );
      }
      return bookingHasPayment;
    } catch (error) {
      throw new HttpException(
        `Error fetching Booking Has Payment with ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ bookingHasPayments: BookingHasPayment[]; total: number }> {
    try {
      const [bookingHasPayments, total] =
        await this.bookingHasPaymentRepository.findAndCount({
          skip: (page - 1) * limit,
          take: limit,
        });
      return { bookingHasPayments, total };
    } catch (error) {
      throw new HttpException(
        `Error fetching Booking Has Payments: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    updateBookingHasPaymentDto: UpdateBookingHasPaymentDto,
  ): Promise<BookingHasPayment> {
    try {
      const bookingHasPayment = await this.findOne(id);
      if (!bookingHasPayment) {
        throw new HttpException(
          `Booking Has Payment with ID ${id} not found.`,
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedBookingHasPayment = Object.assign(
        bookingHasPayment,
        updateBookingHasPaymentDto,
      );
      return await this.bookingHasPaymentRepository.save(
        updatedBookingHasPayment,
      );
    } catch (error) {
      throw new HttpException(
        `Error updating Booking Has Payment: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const bookingHasPayment = await this.findOne(id);
      if (!bookingHasPayment) {
        throw new HttpException(
          `Booking Has Payment with ID ${id} not found.`,
          HttpStatus.NOT_FOUND,
        );
      }
      await this.bookingHasPaymentRepository.delete(id);
    } catch (error) {
      throw new HttpException(
        `Error deleting Booking Has Payment: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByBookingId(bookingId: string): Promise<BookingHasPayment | null> {
    try {
      const bookingHasPayment = await this.bookingHasPaymentRepository.findOne({
        where: { booking_id: bookingId },
      });
      return bookingHasPayment || null;
    } catch (error) {
      throw new HttpException(
        `Error fetching Booking Has Payment by booking ID ${bookingId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByStatus(
    status: 'pending' | 'paid' | 'failed',
  ): Promise<BookingHasPayment[]> {
    try {
      return await this.bookingHasPaymentRepository.find({
        where: { status },
      });
    } catch (error) {
      throw new HttpException(
        `Error fetching Booking Has Payments by status ${status}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
