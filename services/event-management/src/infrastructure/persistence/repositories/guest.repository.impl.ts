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
import { FilterGuestListDto } from 'src/presentation/dtos/guest/filter-guest-list.dto';

const statusMap = {
  pending: 'Booked',
  purchased: 'Paid',
  arrived: 'Completed',
  canceled: 'Cancelled',
  gifted: 'Gifted',
};
@Injectable()
export class GuestRepositoryImpl implements IGuestRepository {
  constructor(
    @InjectRepository(ParticipantHasTicket)
    private readonly participantHasTicketRepository: Repository<ParticipantHasTicket>,
  ) {}

  async filterGuestList(
    status: 'purchased' | 'arrived' | 'canceled' | 'gifted' | 'pending',
    filters: FilterGuestListDto,
    organizerId: string,
  ): Promise<ParticipantHasTicket[] | null> {
    try {
      const statusMap = {
        purchased: 'Paid',
        arrived: 'Completed',
        canceled: 'Cancelled',
        gifted: 'Gifted',
        pending: 'Booked',
      };

      const ticketStatus = statusMap[status];
      if (!ticketStatus) {
        throw new BadRequestException('Invalid status filter');
      }
      const query = this.participantHasTicketRepository
        .createQueryBuilder('participant')
        .leftJoinAndSelect('participant.booking_id', 'booking')
        .leftJoinAndSelect('participant.ticket_id', 'ticket')
        .leftJoinAndSelect('ticket.event_id', 'event')
        .where('ticket.status = :status', { status: ticketStatus })
        .andWhere('event.user_id = :organizerId', { organizerId });

      if (filters.bookingType && filters.bookingType !== 'all') {
        query.andWhere('booking.booking_type = :bookingType', {
          bookingType: filters.bookingType,
        });
      }

      if (filters.date) {
        const startDate = new Date(filters.date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(filters.date);
        endDate.setHours(23, 59, 59, 999);

        query.andWhere({
          created_at: Between(startDate, endDate),
        });
      }

      const guests = await query.getMany();

      return guests.length > 0 ? guests : [];
    } catch (error) {
      throw new HttpException(
        `Error filtering guest list: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
