import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { FilterGuestListDto } from 'src/presentation/dtos/guest/filter-guest-list.dto';

export interface IGuestRepository {
  filterGuestList(
    status: 'purchased' | 'arrived' | 'canceled' | 'gifted' | 'pending',
    filters: FilterGuestListDto,
    organizerId: string,
    offset: number,
    limit: number,
  ): Promise<{
    guests: ParticipantHasTicket[] | [];
    total: number;
  }>;
  findByIdAndEvent(ticketId: string): Promise<ParticipantHasTicket | null>;
}
