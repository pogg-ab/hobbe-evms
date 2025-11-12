import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Events } from 'src/domain/entities/events.entity';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { ITicketsRepository } from 'src/domain/repositories/tickets/tickets.repository';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { QrCodeActionAfterScannedDto } from 'src/presentation/dtos/qr-code/qr-code-action-after-scanned.dto';
import { QrAfterScannedActionsAggregateDto } from 'src/presentation/dtos/qr-code/qr-scaned-after-scanned-action-aggregate.dto';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { DataSource, EntityManager, Equal, Not, Repository } from 'typeorm';
import * as qrcode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

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
  ) {}

  async create(
    createTicketsDto: CreateTicketsDto,
    entityManager?: EntityManager,
  ): Promise<void> {
    try {
      const newTicket = this.ticketsListRepository.create(createTicketsDto);
      newTicket.created_by = 'auto_system';
      newTicket.created_at = new Date();
      newTicket.updated_at = new Date();
      const manager = entityManager || this.ticketsListRepository.manager;

      await manager.save(newTicket);
    } catch (error) {
      throw new HttpException(
        `Error creating Ticket: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMyTickets(
    userId: string,
    page: number,
    limit: number,
  ): Promise<any> {
    const now = new Date();

    const tickets = await this.dataSource
      .createQueryBuilder()
      .select([
        'payment.id AS payment_id',
        'payment.external_reference AS payment_external_reference',
        'payment.event_id AS payment_event_id',
        'payment.booking_id AS payment_booking_id',
        'ticket.id AS ticket_id',
        'ticket.ticket_no AS ticket_ticket_no',
        'ticket.type AS ticket_type',
        'ticket.status AS ticket_status',
        'ticket.price AS ticket_price',
        'ticket.hasPromcode AS ticket_hasPromcode',
        'ticket.qr_code AS ticket_qr_code',
        'ticket.created_at AS ticket_created_at',
        'ticket.updated_at AS ticket_updated_at',
      ])
      .from('payments', 'payment')
      .leftJoin('tickets', 'ticket', 'ticket.booking_id = payment.booking_id')
      .leftJoinAndSelect('events', 'event', 'event.id = payment.event_id')
      .where('payment.user_id = :userId', { userId })
      .andWhere('payment.payment_status != :status', {
        status: 'Refund In Progress',
      })
      .getRawMany();

    const categorized = { upcoming: [], past: [], gifted: [] };

    tickets.forEach((row) => {
      if (row.event_event_start_date > now) categorized.upcoming.push(row);
      else categorized.past.push(row);
    });

    categorized.gifted = await this.participantHasTicketRepository
      .createQueryBuilder('participant_has_ticket')
      .leftJoinAndSelect('participant_has_ticket.ticket_id', 'ticket')
      .leftJoinAndSelect('ticket.event_id', 'event')
      .where('participant_has_ticket.participant_id = :userId', { userId })
      .andWhere('ticket.status = :status', { status: 'Gifted' })
      .take(limit)
      .getMany();

    // return { futureTickets,pastTickets, page, limit };
    return {
      tickets: categorized,
      page: page,
      limit: limit,
    };
  }

  async findOne(id: string): Promise<Tickets | null> {
    try {
      const ticket = await this.ticketsListRepository.findOne({
        where: { id: id },
        relations: ['event_id', 'ticket_heading_id'],
      });

      if (!ticket) {
        throw new HttpException(
          `Ticket with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      // console.log(ticket);

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

  async findTicketsByBookingId(bookingId: string): Promise<Tickets[]> {
    try {
      const tickets = await this.ticketsListRepository.find({
        where: { booking_id: Equal(bookingId) },
      });
      return tickets;
    } catch (error) {
      throw new HttpException(
        `Error fetching Tickets with booking ID ${bookingId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async ticketRefundProcess(id: string): Promise<void> {
    //  lets remove this ticket and create a new ticket with status refunded
    try {
      const ticket = await this.ticketsListRepository.findOne({
        where: { id: Equal(id) },
      });
      if (!ticket) {
        throw new NotFoundException(`Ticket with ID ${id} not found`);
      }
      const ticketNumber = uuidv4();

      const qrCode = await qrcode.toDataURL(
        `http://89.117.37.84/:4001/tickets/get/ticket-info/${ticketNumber}`,
      );

      ticket.status = 'New';
      ticket.booking_id = null;
      ticket.ticket_no = ticketNumber;
      ticket.qr_code = qrCode;
      ticket.updated_by = 'system-refund';
      ticket.updated_at = new Date();
      await this.ticketsListRepository.save(ticket);
    } catch (error) {
      throw new HttpException(
        `Error processing refund for Ticket with ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findTicketsByStatusTypeAndPromocode(
    eventId: IdValueObject,
    type: string,
    status: string,
  ): Promise<Tickets[] | null> {
    try {
      const tickets = await this.ticketsListRepository.find({
        where: {
          event_id: Equal(eventId),
          type: type,
          status: status,
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
    statusCode: number;
  }> {
    const shortId = ticketNumber.slice(0, 7);
    const now = new Date();

    try {
      const ticket = await this.ticketsListRepository.findOne({
        where: { ticket_no: ticketNumber },
        relations: ['event_id'],
      });

      if (!ticket) {
        return {
          success: false,
          message: `Ticket ${shortId}... not found in our system`,
          statusCode: 404,
        };
      }

      if (ticket.status === 'Attended') {
        return {
          success: false,
          message: `Ticket ${shortId}... was previously scanned`,
          statusCode: 409,
        };
      }

      if (ticket.status !== 'Booked' && ticket.status !== 'Attended') {
        return {
          success: false,
          message: `Ticket ${shortId}... has invalid status. Only BOOKED tickets can be marked as ATTENDED.`,
          statusCode: 403, // Forbidden
        };
      }

      const eventJson: Events = JSON.parse(JSON.stringify(ticket.event_id));
      const event = await this.eventRepository.findOne({
        where: { id: eventJson.id },
      });

      const oneDayBefore = new Date(event.event_start_date);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);

      if (now < oneDayBefore) {
        return {
          success: false,
          message: `Early scan attempt - Ticket scanning will be available starting ${oneDayBefore.toLocaleDateString()} at ${oneDayBefore.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          statusCode: 403,
        };
      }

      if (now > event.event_end_date) {
        return {
          success: false,
          message: `Scanning unavailable - The event concluded on ${event.event_end_date.toLocaleDateString()}. Please contact support for assistance.`,
          statusCode: 403,
        };
      }

      ticket.status = 'Attended';
      ticket.updated_by = scannedBy;
      ticket.updated_at = new Date();

      await this.ticketsListRepository.save(ticket);

      return {
        success: true,
        message: `Ticket ${shortId}... successfully marked as attended`,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to mark ticket as attended: ${error.message}`,
        statusCode: 500,
      };
    }
  }
  async updateStatus(
    manager: EntityManager,
    id: IdValueObject,
    booking_id: string,
    status: string,
    user: any,
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
      ticket.booking_id = booking_id;
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
          status: 'Paid',
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
        .count({ where: { event_id: Equal(eventId), status: Not('New') } });

      return count;
    } catch (error) {
      throw new HttpException(
        `Error counting tickets for Event ID ${eventId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async qrCodeScannedLog(ticket_id: string, metadata: string): Promise<any> {
    try {
      const ticket = await this.ticketsListRepository.findOne({
        where: { ticket_no: ticket_id },
      });

      if (!ticket) {
        throw new NotFoundException(`Ticket with ID ${ticket_id} not found`);
      }

      // Assuming you have a QrScanLogs entity to log the scan
      const qrScanLog = this.dataSource.getRepository('QrScanLogs').create({
        ticket: ticket,
        action_taken: 'scanned',
        scanned_at: new Date(),
        metadata: metadata,
      });
      return await this.dataSource.getRepository('QrScanLogs').save(qrScanLog);
    } catch (error) {
      throw new HttpException(
        `Error logging QR code scan: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async qrCodeLogAfterScanned(dto: QrCodeActionAfterScannedDto): Promise<void> {
    try {
      const qrScanLog = await this.dataSource
        .getRepository('QrScanLogs')
        .findOne({
          where: { id: dto.id },
        });

      if (!qrScanLog) {
        throw new NotFoundException(`QR Scan Log with ID ${dto.id} not found`);
      }

      qrScanLog.action_taken_after_scan = dto.action_taken_after_scan;
      await this.dataSource.getRepository('QrScanLogs').save(qrScanLog);
    } catch (error) {
      throw new HttpException(
        `Error updating QR code scan log after scan: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async countQrCodeScannedLogs(event_id: string): Promise<any> {
    try {
      const count = await this.dataSource
        .getRepository('QrScanLogs')
        .createQueryBuilder('qr_scan_logs')
        .leftJoinAndSelect('qr_scan_logs.ticket', 'ticket')
        .where('ticket.event_id = :eventId', { eventId: event_id })
        .getCount();

      // can we add each ticket_id and count of scanned logs
      const scannedLogs = await this.dataSource
        .getRepository('QrScanLogs')
        .createQueryBuilder('qr_scan_logs')
        .select('qr_scan_logs.ticket_id', 'ticket_id')

        .addSelect('COUNT(qr_scan_logs.id)', 'scanned_count')
        .where(
          'qr_scan_logs.ticket_id IN (SELECT id FROM tickets WHERE event_id = :eventId)',
          { eventId: event_id },
        )
        .groupBy('qr_scan_logs.ticket_id')
        .getRawMany();

      return scannedLogs.map((log) => ({
        event: event_id,
        ticket_id: log.ticket_id,
        scannedCount: log.scanned_count,
      }));
    } catch (error) {
      throw new HttpException(
        `Error counting QR code scanned logs for Event ID ${event_id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async qrCodeActionsAfterScanned(
    dto: QrAfterScannedActionsAggregateDto,
  ): Promise<any> {
    try {
      const actions = await this.dataSource
        .getRepository('QrScanLogs')
        .createQueryBuilder('qr_scan_logs')
        .select(
          'qr_scan_logs.action_taken_after_scan',
          'action_taken_after_scan',
        )
        .addSelect('COUNT(qr_scan_logs.id)', 'scanned_count')
        .where('qr_scan_logs.scanned_at BETWEEN :startDate AND :endDate', {
          startDate: dto.startDate,
          endDate: dto.endDate,
        })
        .groupBy('qr_scan_logs.action_taken_after_scan')
        .getRawMany();

      return actions.map((action) => ({
        action_taken_after_scan: action.action_taken_after_scan,
        scanned_count: action.scanned_count,
      }));
    } catch (error) {
      throw new HttpException(
        `Error aggregating QR code actions after scanned: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async aggregateQrCodeScannedLogs(dto: any): Promise<any> {
    // Assuming dto contains startDate and endDate for the aggregation
    if (!dto.startDate || !dto.endDate) {
      throw new BadRequestException(
        'Start date and end date are required for aggregation',
      );
    }
    if (
      !dto.aggregateType ||
      !['day', 'week', 'month', 'year'].includes(dto.aggregateType)
    ) {
      throw new BadRequestException(
        'Invalid aggregate type. Must be one of: day, week, month, year',
      );
    }

    // Example aggregation logic using TypeORM QueryBuilder
    // undurstand aggregation type is time range
    const queryBuilder = this.dataSource
      .getRepository('QrScanLogs')
      .createQueryBuilder('qr_scan_logs')
      .select('qr_scan_logs.ticket_id', 'ticket_id')
      .addSelect(
        `DATE_TRUNC('${dto.aggregateType}', qr_scan_logs.scanned_at)`,
        'aggregation_date',
      )
      .addSelect('COUNT(qr_scan_logs.id)', 'scanned_count')
      .where('qr_scan_logs.scanned_at BETWEEN :startDate AND :endDate', {
        startDate: dto.startDate,
        endDate: dto.endDate,
      })
      .groupBy('qr_scan_logs.ticket_id, aggregation_date');
    try {
      const aggregatedLogs = await queryBuilder.getRawMany();

      // Format the result to match the expected output
      return aggregatedLogs.map((log) => ({
        ticket_id: log.ticket_id,
        aggregation_date: log.aggregation_date,
        scanned_count: log.scanned_count,
      }));
    } catch (error) {
      throw new HttpException(
        `Error aggregating QR code scanned logs: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async regenerateTicketQrCode(ticketId: string, userId): Promise<void> {
    try {
      const ticket = await this.ticketsListRepository.findOne({
        where: { id: Equal(ticketId) },
      });
      if (!ticket) {
        throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
      }
      const newTicketNumber = uuidv4();
      const newQrCode = await qrcode.toDataURL(
        `http://http://89.117.37.84/:4001/tickets/get/ticket-info/${newTicketNumber}`,
      );

      ticket.ticket_no = newTicketNumber;
      ticket.qr_code = newQrCode;
      ticket.updated_at = new Date();
      ticket.updated_by = userId;

      await this.ticketsListRepository.save(ticket);
    } catch (error) {
      throw new HttpException(
        `Error regenerating QR code for Ticket with ID ${ticketId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
