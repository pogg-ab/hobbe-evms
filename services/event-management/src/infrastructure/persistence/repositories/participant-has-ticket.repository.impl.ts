import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { IParticipantHasTicketRepository } from 'src/domain/repositories/tickets/participant-has-ticket.repository';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ParticipantHasTicketRepositoryImpl
  implements IParticipantHasTicketRepository
{
  constructor(
    @InjectRepository(ParticipantHasTicket)
    private participantHasTicketRepository: Repository<ParticipantHasTicket>,
    @InjectRepository(TicketBooking)
    private ticketBookingRepository: Repository<TicketBooking>,
    @InjectRepository(Tickets)
    private ticketRepository: Repository<Tickets>,
  ) {}

  async create(
    manager: EntityManager,
    bookingId: string,
    ticketId: string,
    participantId: string,
    user: any,
  ): Promise<void> {
    try {
      const ticketBooking = await manager.findOne(TicketBooking, {
        where: { booking_id: bookingId },
      });

      const ticket = await manager.findOne(Tickets, {
        where: { id: ticketId },
      });

      if (!ticketBooking || !ticket) {
        throw new HttpException(
          'Ticket or TicketBooking not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const newParticipantHasTicket =
        this.participantHasTicketRepository.create({
          booking_id: ticketBooking,
          ticket_id: ticket,
          participant_id: participantId,
        });

      newParticipantHasTicket.created_by = user;
      newParticipantHasTicket.updated_by = user;
      newParticipantHasTicket.created_at = new Date();
      newParticipantHasTicket.updated_at = new Date();

      await manager.save(newParticipantHasTicket);
    } catch (error) {
      throw new HttpException(
        `Error creating Participant Has Ticket: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByParticipantId(
    participantId: string,
  ): Promise<ParticipantHasTicket[] | null> {
    try {
      const participantTickets = await this.participantHasTicketRepository.find(
        {
          where: { participant_id: participantId },
        },
      );
      return participantTickets;
    } catch (error) {
      throw new HttpException(
        `Error fetching Participant Has Tickets for Participant ID ${participantId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(participantHasTicketId: string): Promise<void> {
    try {
      const participantHasTicket =
        await this.participantHasTicketRepository.findOne({
          where: { participant_has_ticket_id: participantHasTicketId },
        });
      if (!participantHasTicket) {
        throw new HttpException(
          `Participant Has Ticket with ID ${participantHasTicketId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      await this.participantHasTicketRepository.remove(participantHasTicket);
    } catch (error) {
      throw new HttpException(
        `Error deleting Participant Has Ticket with ID ${participantHasTicketId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
