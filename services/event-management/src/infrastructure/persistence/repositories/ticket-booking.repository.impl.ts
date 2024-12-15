import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { ITicketBookingRepository } from 'src/domain/repositories/ticket-booking.repository';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CreateTicketBookingDto } from 'src/presentation/dtos/ticket-booking/create-ticket-booking.dto';
import { DataSource, Equal, Repository } from 'typeorm';

@Injectable()
export class TicketBookingRepositoryEmpl implements ITicketBookingRepository {
  constructor(
    @InjectRepository(TicketBooking)
    private ticketBookingRepository: Repository<TicketBooking>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createTicketBookingDto: CreateTicketBookingDto): Promise<void> {
    try {
      const newTicketBooking = this.ticketBookingRepository.create(
        createTicketBookingDto,
      );
      await this.ticketBookingRepository.save(newTicketBooking);
    } catch (error) {
      throw new HttpException(
        `Error creating Ticket Booking: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<TicketBooking | null> {
    try {
      const ticketBooking = await this.ticketBookingRepository.findOne({
        where: { id: id },
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

      return { ticketBookings, total, page, limit };
    } catch (error) {
      throw new HttpException(
        `Error fetching Ticket Bookings: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllByTicketHeading(
    ticket_heading_id: string,
    status?: string,
  ): Promise<{ ticketBookings: TicketBooking[] | null }> {
    try {
      if (!status) {
        const ticketBookings = await this.ticketBookingRepository.find({
          where: { ticket_heading_id: Equal(ticket_heading_id) },
        });
        return { ticketBookings };
      } else {
        const ticketBookings = await this.ticketBookingRepository.find({
          where: {
            ticket_heading_id: Equal(ticket_heading_id),
            status: Equal(status),
          },
        });
        return { ticketBookings };
      }
    } catch (error) {
      throw new HttpException(
        `Error fetching Ticket Bookings by Ticket Heading: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTicketBookingsByEvent(
    event_id: IdValueObject,
  ): Promise<TicketBooking[] | null> {
    try {
      const data = `SELECT * FROM ticket_bookings WHERE event_id = '${event_id}'`;
      const ticketBookings = await this.dataSource.query(data);
      return ticketBookings;
    } catch (error) {
      throw new HttpException(
        `Error fetching Ticket Bookings for Event ID ${event_id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
