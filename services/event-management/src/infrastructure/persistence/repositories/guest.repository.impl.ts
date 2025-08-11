import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { Events } from 'src/domain/entities/events.entity';
import { IGuestRepository } from 'src/domain/repositories/guests/guest.repository';
import { Repository, Between, Equal, Like } from 'typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class GuestRepositoryImpl implements IGuestRepository {
  constructor(
    @InjectRepository(ParticipantHasTicket)
    private readonly participantHasTicketRepository: Repository<ParticipantHasTicket>,
    @InjectRepository(TicketBooking)
    private readonly ticketBookingRepository: Repository<TicketBooking>,
    @InjectRepository(Events)
    private readonly eventRepository: Repository<Events>,
    private readonly dataSource: DataSource,
  ) {}

  async filterGuestList(
    status: 'purchased' | 'arrived' | 'canceled' | 'gifted',
    filters: {
      gender?: 'all' | 'male' | 'female';
      date?: string;
      bookingType?: 'all' | 'Regular' | 'VIP' | 'VVIP';
      sort?: 'asc' | 'desc';
    },
  ): Promise<ParticipantHasTicket[] | null> {
    try {
      const query = this.participantHasTicketRepository
        .createQueryBuilder('participant')
        .leftJoinAndSelect('participant.ticketBooking', 'ticketBooking')
        .leftJoinAndSelect('participant.ticket', 'ticket')
        .leftJoinAndSelect('ticket.event', 'event')
        .where('participant.status = :status', { status });

      // Apply gender filter
      if (filters.gender && filters.gender !== 'all') {
        query.andWhere('participant.gender = :gender', {
          gender: filters.gender,
        });
      }

      // Apply booking type filter
      if (filters.bookingType && filters.bookingType !== 'all') {
        query.andWhere('ticketBooking.type = :type', {
          type: filters.bookingType,
        });
      }

      // Apply date filter
      if (filters.date) {
        const startDate = new Date(filters.date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(filters.date);
        endDate.setHours(23, 59, 59, 999);

        query.andWhere({
          createdAt: Between(startDate, endDate),
        });
      }

      // Apply sorting
      if (filters.sort) {
        query.orderBy(
          'participant.name',
          filters.sort === 'asc' ? 'ASC' : 'DESC',
        );
      }

      const guests = await query.getMany();

      return guests.length > 0 ? guests : null;
    } catch (error) {
      throw new HttpException(
        `Error filtering guest list: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
