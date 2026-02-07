import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingHasPromocode } from 'src/domain/entities/booking-has-promocode.entity';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { Promocodes } from 'src/domain/entities/promocodes.entity';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { IBookingHasPromocodeRepository } from 'src/domain/repositories/tickets/booking-has-promocode.repository';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class BookingHasPromocodeRepositoryImpl
  implements IBookingHasPromocodeRepository {
  constructor(
    @InjectRepository(BookingHasPromocode)
    private bookingHasPromocodeRepository: Repository<BookingHasPromocode>,
    @InjectRepository(Promocodes)
    private promocodeRepository: Repository<Promocodes>,
    @InjectRepository(TicketBooking)
    private ticketBookingRepository: Repository<TicketBooking>,
    @InjectRepository(ParticipantHasTicket)
    private participantHasTicketRepository: Repository<ParticipantHasTicket>,
  ) { }

  async create(
    manager: EntityManager,
    bookingId: string,
    promocodeId: string,
    user: any,
  ): Promise<void> {
    try {
      const ticketBooking = await manager.findOne(TicketBooking, {
        where: { booking_id: bookingId },
      });

      const promocode = await manager.findOne(Promocodes, {
        where: { id: promocodeId },
      });

      if (!ticketBooking || !promocode) {
        throw new HttpException(
          'TicketBooking or Promocode not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const newBookingHasPromocode = this.bookingHasPromocodeRepository.create({
        booking_id: ticketBooking,
        promocode_id: promocode,
      });

      newBookingHasPromocode.created_by = user;
      newBookingHasPromocode.updated_by = user;
      newBookingHasPromocode.created_at = new Date();
      newBookingHasPromocode.updated_at = new Date();

      await manager.save(newBookingHasPromocode);
    } catch (error) {
      throw new HttpException(
        `Error creating Booking Has Promocode: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByBookingId(
    bookingId: string,
  ): Promise<BookingHasPromocode[] | null> {
    try {
      return await this.bookingHasPromocodeRepository.find({
        where: { booking_id: { booking_id: bookingId } },
      });
    } catch (error) {
      throw new HttpException(
        `Error fetching Booking Has Promocode for Booking ID ${bookingId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneById(
    bookingHasPromocodeId: string,
  ): Promise<BookingHasPromocode | null> {
    try {
      return await this.bookingHasPromocodeRepository.findOne({
        where: { booking_has_promocode_id: bookingHasPromocodeId },
      });
    } catch (error) {
      throw new HttpException(
        `Error fetching Booking Has Promocode with ID ${bookingHasPromocodeId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    manager: EntityManager,
    bookingHasPromocodeId: string,
    promocodeId: string,
    user: any,
  ): Promise<void> {
    try {
      const bookingHasPromocode = await manager.findOne(BookingHasPromocode, {
        where: { booking_has_promocode_id: bookingHasPromocodeId },
      });

      if (!bookingHasPromocode) {
        throw new HttpException(
          `Booking Has Promocode with ID ${bookingHasPromocodeId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const promocode = await manager.findOne(Promocodes, {
        where: { id: promocodeId },
      });

      if (!promocode) {
        throw new HttpException('Promocode not found', HttpStatus.NOT_FOUND);
      }

      bookingHasPromocode.promocode_id = promocode;
      bookingHasPromocode.updated_by = user;
      bookingHasPromocode.updated_at = new Date();

      await manager.save(bookingHasPromocode);
    } catch (error) {
      throw new HttpException(
        `Error updating Booking Has Promocode with ID ${bookingHasPromocodeId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(bookingHasPromocodeId: string): Promise<void> {
    try {
      const bookingHasPromocode =
        await this.bookingHasPromocodeRepository.findOne({
          where: { booking_has_promocode_id: bookingHasPromocodeId },
        });

      if (!bookingHasPromocode) {
        throw new HttpException(
          `Booking Has Promocode with ID ${bookingHasPromocodeId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.bookingHasPromocodeRepository.remove(bookingHasPromocode);
    } catch (error) {
      throw new HttpException(
        `Error deleting Booking Has Promocode with ID ${bookingHasPromocodeId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByPromocode(promocodeId: any): Promise<string[]> {
    try {
      const bookingHasPromocodes = await this.bookingHasPromocodeRepository.find({
        where: { promocode_id: { id: promocodeId } },
        relations: ['booking_id'],
      });

      const bookingIds = bookingHasPromocodes.map(
        (bookingHasPromocode) => bookingHasPromocode.booking_id.booking_id,
      );

      return bookingIds;
    } catch (error) {
      throw new HttpException(
        `Error finding tickets for Promocode ID ${promocodeId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async countTicketsForBooking(bookingIds: string[]): Promise<number> {
    try {
      const ticketCounts = await this.participantHasTicketRepository
        .createQueryBuilder('participantHasTicket')
        .where('participantHasTicket.booking_id IN (:...bookingIds)', {
          bookingIds,
        })
        .getCount();

      return ticketCounts;
    } catch (error) {
      throw new HttpException(
        `Error counting tickets for Booking IDs ${bookingIds.join(', ')}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
