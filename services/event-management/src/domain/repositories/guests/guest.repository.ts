import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';

export interface IGuestRepository {
  filterGuestList(
    status: 'purchased' | 'arrived' | 'canceled' | 'gifted',
    filters: {
      gender?: 'all' | 'male' | 'female';
      date?: string;
      bookingType?: 'all' | 'Regular' | 'VIP' | 'VVIP';
      sort?: 'asc' | 'desc';
    },
  ): Promise<ParticipantHasTicket[] | null>;
}
