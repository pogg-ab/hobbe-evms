import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { EntityManager } from 'typeorm';

export interface IParticipantHasTicketRepository {
  create(
    manager: EntityManager,
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
