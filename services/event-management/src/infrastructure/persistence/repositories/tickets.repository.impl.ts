import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { ITicketsRepository } from 'src/domain/repositories/tickets/tickets.repository';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { DataSource, EntityManager, Equal, Repository } from 'typeorm';

@Injectable()
export class TicketsRepositoryEmpl implements ITicketsRepository {
  constructor(
    @InjectRepository(Tickets)
    private ticketsListRepository: Repository<Tickets>,
    private readonly dataSource: DataSource,
    @InjectRepository(ParticipantHasTicket)
    private participantHasTicketRepository: Repository<ParticipantHasTicket>,
  ) { }

  async create(createTicketsDto: CreateTicketsDto): Promise<void> {
    try {
      const newTicket = this.ticketsListRepository.create(createTicketsDto);
      await this.ticketsListRepository.save(newTicket);
    } catch (error) {
      throw new HttpException(
        `Error creating Ticket: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<Tickets | null> {
    try {
      const ticket = await this.ticketsListRepository.findOne({
        where: { id: id },
      });

      if (!ticket) {
        throw new HttpException(
          `Ticket with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return ticket;
    } catch (error) {
      throw new HttpException(
        `Error fetching Ticket with ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{
    tickets: Tickets[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      // return await this.eventRepository.find();

      const offset = (page - 1) * limit; // Calculate the offset

      // Use QueryBuilder to handle pagination
      const [tickets, total] = await this.ticketsListRepository
        .createQueryBuilder('tickets') // 'tickets' is the alias for your table/entity
        .skip(offset) // Number of rows to skip
        .take(limit) // Number of rows to fetch
        .getManyAndCount(); // Fetch entities and total count

      return { tickets, total, page, limit };
    } catch (error) {
      throw new HttpException(
        `Error fetching Events: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllByTicketsHeading(
    ticket_heading_id: string,
    tickets_type?: string,
    status?: string,
  ): Promise<{
    tickets: Tickets[] | null;
  }> {
    try {
      if (!tickets_type && !status) {
        const tickets = await this.ticketsListRepository.find({
          where: { ticket_heading_id: Equal(ticket_heading_id) },
        });
        return { tickets };
      } else if (tickets_type) {
        const tickets = await this.ticketsListRepository.find({
          where: {
            ticket_heading_id: Equal(ticket_heading_id),
            type: Equal(tickets_type),
          },

          // relations: ['ticket_heading_id'],
        }); // 'event' is the alias for your table/entity
        return { tickets };
      } else if (status) {
        const tickets = await this.ticketsListRepository.find({
          where: {
            ticket_heading_id: Equal(ticket_heading_id),
            status: Equal(status),
          },
        });
        return { tickets };
      }
    } catch (error) {
      throw new HttpException(
        `Error fetching Tickets : ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEventsAllTicketsList(
    ticket_heading_id: IdValueObject,
  ): Promise<Tickets[] | null> {
    try {
      // Use 'find' instead of 'findBy'
      const data = `SELECT * FROM tickets
      WHERE ticket_heading_id = '${ticket_heading_id}'`;
      const tickets = this.dataSource.query(data);
      // Check if no events were found

      return tickets;
    } catch (error) {
      console.error('Error fetching tickets list:', error);
      throw new HttpException(
        `Error fetching Tickets List with Tickets id ${ticket_heading_id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findTicketsByStatusTypeAndPromocode(
    eventId: IdValueObject,
    type: string,
    status: string,
    hasPromocode: boolean,
  ): Promise<Tickets[] | null> {
    try {
      const tickets = await this.ticketsListRepository.find({
        where: {
          event_id: Equal(eventId),
          type: type,
          status: status,
          hasPromcode: hasPromocode,
        },
      });

      return tickets.length > 0 ? tickets : null;
    } catch (error) {
      throw new Error(`Error fetching tickets: ${error.message}`);
    }
  }
  async updateStatus(
    manager: EntityManager,
    id: IdValueObject,
    status: string,
    user: any
  ): Promise<Tickets | null> {
    try {
      const ticket = await manager.findOne(Tickets, {
        where: { id },
      });

      if (!ticket) {
        throw new HttpException(
          `Ticket with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      ticket.status = status;
      ticket.updated_by = user;
      ticket.updated_at = new Date();

      await this.ticketsListRepository.save(ticket);

      return ticket;
    } catch (error) {
      throw new HttpException(
        `Error updating status for Ticket with ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findUpcomingTickets(
    userId: string,
    page: number,
    limit: number,
  ): Promise<ParticipantHasTicket[] | null> {
    try {
      const offset = (page - 1) * limit;

      const tickets = await this.participantHasTicketRepository
        .createQueryBuilder('participant_has_ticket')
        .leftJoinAndSelect('participant_has_ticket.ticket_id', 'ticket')
        .leftJoinAndSelect('ticket.event_id', 'event')
        .where('participant_has_ticket.participant_id = :userId', {
          userId,
        })
        .andWhere('event.event_end_date > NOW()')
        .skip(offset)
        .take(limit)
        .getMany();

      return tickets.length > 0 ? tickets : null;
    } catch (error) {
      throw new HttpException(
        `Error fetching upcoming tickets: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async countUpcomingTickets(userId: string): Promise<number> {
    try {
      const count = await this.participantHasTicketRepository
        .createQueryBuilder('participant_has_ticket')
        .leftJoinAndSelect('participant_has_ticket.ticket_id', 'ticket')
        .leftJoinAndSelect('ticket.event_id', 'event')
        .where('participant_has_ticket.participant_id = :userId', {
          userId,
        })
        .andWhere('event.event_end_date > NOW()')
        .getCount();

      return count;
    } catch (error) {
      throw new HttpException(
        `Error counting upcoming tickets: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPastTickets(
    userId: string,
    page: number,
    limit: number,
  ): Promise<ParticipantHasTicket[] | null> {
    try {
      const offset = (page - 1) * limit;

      const tickets = await this.participantHasTicketRepository
        .createQueryBuilder('participant_has_ticket')
        .leftJoinAndSelect('participant_has_ticket.ticket_id', 'ticket')
        .leftJoinAndSelect('ticket.event_id', 'event')
        .where('participant_has_ticket.participant_id = :userId', {
          userId,
        })
        .andWhere('event.event_end_date < NOW()')
        .skip(offset)
        .take(limit)
        .getMany();

      return tickets.length > 0 ? tickets : null;
    } catch (error) {
      throw new HttpException(
        `Error fetching past tickets: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async countPastTickets(userId: string): Promise<number> {
    try {
      const count = await this.participantHasTicketRepository
        .createQueryBuilder('participant_has_ticket')
        .leftJoinAndSelect('participant_has_ticket.ticket_id', 'ticket')
        .leftJoinAndSelect('ticket.event_id', 'event')
        .where('participant_has_ticket.participant_id = :userId', {
          userId,
        })
        .andWhere('event.event_end_date < NOW()')
        .getCount();

      return count;
    } catch (error) {
      throw new HttpException(
        `Error counting past tickets: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findGiftedTickets(
    userId: string,
    page: number,
    limit: number,
  ): Promise<ParticipantHasTicket[] | null> {
    try {
      const offset = (page - 1) * limit;

      const tickets = await this.participantHasTicketRepository
        .createQueryBuilder('participant_has_ticket')
        .leftJoinAndSelect('participant_has_ticket.ticket_id', 'ticket')
        .leftJoinAndSelect('ticket.event_id', 'event')
        .where('participant_has_ticket.participant_id = :userId', { userId })
        .andWhere('ticket.status = :status', { status: 'Gifted' })
        .skip(offset)
        .take(limit)
        .getMany();

      return tickets.length > 0 ? tickets : null;
    } catch (error) {
      throw new HttpException(
        `Error fetching gifted tickets: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async countGiftedTickets(userId: string): Promise<number> {
    try {
      const count = await this.participantHasTicketRepository
        .createQueryBuilder('participant_has_ticket')
        .leftJoinAndSelect('participant_has_ticket.ticket_id', 'ticket')
        .where('participant_has_ticket.participant_id = :userId', { userId })
        .andWhere('ticket.status = :status', { status: 'Gifted' })
        .getCount();

      return count;
    } catch (error) {
      throw new HttpException(
        `Error counting gifted tickets: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
