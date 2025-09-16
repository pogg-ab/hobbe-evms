import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingHasPayment } from 'src/domain/entities/booking-has-payment.entity';
import { Events } from 'src/domain/entities/events.entity';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { ITicketBookingRepository } from 'src/domain/repositories/tickets/ticket-booking.repository';
import { CreateTicketBookingDto } from 'src/presentation/dtos/tickets/create-ticket-booking.dto';
import { DataSource, EntityManager, Equal, Repository } from 'typeorm';

@Injectable()
export class TicketBookingRepositoryImpl implements ITicketBookingRepository {
  constructor(
    @InjectRepository(TicketBooking)
    private ticketBookingRepository: Repository<TicketBooking>,
    @InjectRepository(Events)
    private eventRepository: Repository<Events>,
    @InjectRepository(BookingHasPayment)
    private bookingHasPaymentRepository: Repository<BookingHasPayment>,
    private readonly dataSource: DataSource,
  ) { }

  async create(
    manager: EntityManager,
    ticketBooking: TicketBooking,
    user: any,
  ): Promise<TicketBooking> {
    try {
      const newTicketBooking =
        this.ticketBookingRepository.create(ticketBooking);
      newTicketBooking.user_id = user;
      newTicketBooking.created_by = user;
      newTicketBooking.created_at = new Date();
      newTicketBooking.updated_at = new Date();
      await manager.save(TicketBooking, newTicketBooking);
      return newTicketBooking;
    } catch (error) {
      throw new HttpException(
        `Error creating Ticket Booking: ${error.message || error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{
    ticketBookings: TicketBooking[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      const [ticketBookings, total] = await this.ticketBookingRepository
        .createQueryBuilder('ticketBooking')
        .skip(offset)
        .take(limit)
        .getManyAndCount();
      return { ticketBookings: ticketBookings, total, page, limit };
    } catch (error) {
      throw new HttpException(
        `Error fetching Ticket Bookings: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<TicketBooking | null> {
    try {
      const ticketBooking = await this.ticketBookingRepository.findOne({
        where: { booking_id: id },
      });
      if (!ticketBooking) {
        throw new HttpException(
          `Ticket Booking with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return ticketBooking;
    } catch (error) {
      throw new HttpException(
        `Error fetching Ticket Booking with ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllByEvent(event_id: string): Promise<TicketBooking[] | null> {
    try {
      const ticketBookings = await this.ticketBookingRepository.find({
        where: { event_id: Equal(event_id) },
      });
      return ticketBookings;
    } catch (error) {
      throw new HttpException(
        `Error fetching Ticket Bookings for Event ID ${event_id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllByTicketBuyer(
    ticket_buyer_id: string,
  ): Promise<TicketBooking[] | null> {
    try {
      const ticketBookings = await this.ticketBookingRepository.find({
        where: { user_id: Equal(ticket_buyer_id) },
      });
      return ticketBookings;
    } catch (error) {
      throw new HttpException(
        `Error fetching Ticket Bookings for Ticket Buyer ID ${ticket_buyer_id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllByEventOrganizer(
    event_organizer_id: string,
  ): Promise<{ event: Event; ticketBookings: TicketBooking[] }[] | null> {
    try {
      const events = await this.eventRepository.find({
        where: { user_id: Equal(event_organizer_id) },
      });

      if (!events.length) {
        return null;
      }

      const eventsGroupedByBooking: {
        event: any;
        ticketBookings: TicketBooking[];
      }[] = [];

      for (const event of events) {
        const ticketBookings = await this.ticketBookingRepository.find({
          where: { event_id: Equal(event.id) },
        });

        eventsGroupedByBooking.push({
          event,
          ticketBookings,
        });
      }

      return eventsGroupedByBooking;
    } catch (error) {
      throw new HttpException(
        `Error fetching Ticket Bookings for Event Organizer ID ${event_organizer_id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    updateTicketBookingDto: CreateTicketBookingDto,
    user: any,
  ): Promise<TicketBooking> {
    try {
      const ticketBooking = await this.findOne(id);
      const updatedTicketBooking = this.ticketBookingRepository.merge(
        ticketBooking,
        updateTicketBookingDto,
      );
      updatedTicketBooking.updated_by = user;
      await this.ticketBookingRepository.save(updatedTicketBooking);
      return updatedTicketBooking;
    } catch (error) {
      throw new HttpException(
        `Error updating Ticket Booking with ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async updateStatus(
    id: string,
    booking_status: string,
    updated_at: string,
  ): Promise<TicketBooking> {
    try {
      const ticketBooking = await this.findOne(id);
      const updatedTicketBooking = this.ticketBookingRepository.merge(
        ticketBooking,
        { booking_status, updated_at },
      );
     
      await this.ticketBookingRepository.save(updatedTicketBooking);
      return updatedTicketBooking;
    } catch (error) {
      throw new HttpException(
        `Error status updating Ticket Booking with ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const ticketBooking = await this.findOne(id);
      await this.ticketBookingRepository.remove(ticketBooking);
    } catch (error) {
      throw new HttpException(
        `Error deleting Ticket Booking with ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Replace the existing findUserIdsByEventId method

async findUserIdsByEventId(eventId: string): Promise<string[]> {
    try {
        // --- THIS IS THE FIX ---
        // We use the QueryBuilder for a more precise and robust query.
        // This avoids any confusion with entity relations.
        const bookings = await this.ticketBookingRepository.createQueryBuilder("booking")
            .select("booking.user_id", "user_id") // Select only the user_id column
            .where("booking.event_id = :eventId", { eventId })
            .getRawMany(); // getRawMany is efficient as it returns simple objects

        if (bookings.length === 0) {
            return [];
        }

        // The result from getRawMany is like [{ user_id: '...' }, { user_id: '...' }]
        // We use a Set to get the unique user IDs from this array.
        const uniqueUserIds = new Set(bookings.map(booking => booking.user_id));

        return Array.from(uniqueUserIds);
    } catch (error) {
        throw new InternalServerErrorException(`Error fetching user IDs for event ${eventId}: ${error.message}`);
    }
}

}
