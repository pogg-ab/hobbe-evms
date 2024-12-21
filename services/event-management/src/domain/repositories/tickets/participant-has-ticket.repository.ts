import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';

export interface IParticipantHasTicketRepository {
  create(
    bookingId: string,
    ticketId: string,
    participantId: string,
    user: any,
  ): Promise<void>;
  findByParticipantId(
    participantId: string,
  ): Promise<ParticipantHasTicket[] | null>;
  delete(participantHasTicketId: string): Promise<void>;
}

export const CREATE_PARTICIPANT_HAS_TICKET_REPOSITORY_TOKEN =
  'CREATE_PARTICIPANT_HAS_TICKET_REPOSITORY_TOKEN';
