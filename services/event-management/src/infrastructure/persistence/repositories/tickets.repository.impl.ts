import { BadRequestException, ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Events } from 'src/domain/entities/events.entity';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { ITicketsRepository } from 'src/domain/repositories/tickets/tickets.repository';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { DataSource, EntityManager, Equal, Not, Repository } from 'typeorm';

@Injectable()
export class TicketsRepositoryEmpl implements ITicketsRepository {
  constructor(
    @InjectRepository(Tickets)
    private ticketsListRepository: Repository<Tickets>,
    @InjectRepository(Events)
    private eventRepository: Repository<Events>,
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

  async markAsAttended(
    ticketNumber: string,
    scannedBy: string,
  ): Promise<{
    success: boolean;
    message: string;
    // data: Tickets | null;
  }> {
    const shortId = ticketNumber.slice(0, 7);
    const now = new Date();

    try {
      const ticket = await this.ticketsListRepository.findOne({
        where: { ticket_no: ticketNumber },
        relations: ['event_id']
      });

      if (!ticket) {
        throw new NotFoundException({
          success: false,
          message: `Ticket ${shortId}... not found in our system`,
        });
      }

      if (ticket.status === 'Attended') {
        throw new ConflictException({
          success: false,
          message: `Ticket ${shortId}... was previously scanned`,
        });
      }
      if (ticket.status !== 'Booked' && ticket.status !== 'Attended') {
        throw new ForbiddenException({
          success: false,
          message: `Ticket ${shortId}... has invalid status. ` +
            `Only BOOKED tickets can be marked as ATTENDED.`,
        });
      }
      const eventJson: Events = JSON.parse(JSON.stringify(ticket.event_id));

      const event = await this.eventRepository.findOne({
        where: { id: eventJson.id },
      });

      const oneDayBefore = new Date(event.event_start_date);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);

      if (now < oneDayBefore) {
        throw new ForbiddenException({
          success: false,
          message: `Early scan attempt - Ticket scanning will be available starting ${oneDayBefore.toLocaleDateString()} at ${oneDayBefore.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        });
      }

      if (now > event.event_end_date) {
        throw new ForbiddenException({
          success: false,
          message: `Scanning unavailable - The event concluded on ${event.event_end_date.toLocaleDateString()}. Please contact support for assistance.`,
        });
      }

      ticket.status = 'Attended';
      ticket.updated_by = scannedBy;
      ticket.updated_at = new Date();

      const updatedTicket = await this.ticketsListRepository.save(ticket);

      return {
        success: true,
        message: `Ticket ${shortId}... successfully marked as attended`,
        // data: updatedTicket
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof ForbiddenException) {
        throw error;
      }

      throw new InternalServerErrorException({
        success: false,
        message: `Failed to mark ticket as attended: ${error.message}`,
        // data: null
      });
    }
  }
  async updateStatus(
    manager: EntityManager,
    id: IdValueObject,
    booking_id: string,
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
      ticket.booking_id = booking_id; // Assuming ticket_id is the booking ID
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

  async updateStatusAfterPayment(
    manager: EntityManager,
    booking_id: string,
  ): Promise<void> {
    try {
      const result = await manager
        .createQueryBuilder()
        .update(Tickets)
        .set({
          status: 'paid', // or whatever status you want to set
          updated_at: new Date(),
        })
        .where('booking_id = :booking_id', { booking_id })
        .execute();

      if (result.affected === 0) {
        throw new HttpException(
          `No tickets found with booking_id ${booking_id}`,
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      throw new HttpException(
        `Error updating tickets for booking_id ${booking_id}: ${error.message}`,
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

  async countAllTicketsForEvent(
    manager: EntityManager,
    eventId: string,
  ): Promise<number> {
    try {
      const count = await manager
        .getRepository(Tickets)
        .count({ where: { event_id: Equal(eventId), status: Not('New'), } });

      return count;
    } catch (error) {
      throw new HttpException(
        `Error counting tickets for Event ID ${eventId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
