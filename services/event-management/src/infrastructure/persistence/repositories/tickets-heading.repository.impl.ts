import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketsHeading } from 'src/domain/entities/tickets-heading.entity';
import { ITicketsHeadingRepository } from 'src/domain/repositories/tickets/tickets-heading.repository';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CreateTicketsHeadingDto } from 'src/presentation/dtos/tickets/create-tickets-heading.dto';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class TicketsHeadingRepositoryEmpl implements ITicketsHeadingRepository {
  constructor(
    @InjectRepository(TicketsHeading)
    private ticketsHeadingRepository: Repository<TicketsHeading>,
    private readonly entityManager: EntityManager,
    // private readonly dataSource: DataSource,
  ) {}

  async create(
    event_id: IdValueObject,
    createTicketsHeadingDto: CreateTicketsHeadingDto,
  ): Promise<TicketsHeading> {
    try {
      const ticket = this.ticketsHeadingRepository.create(
        createTicketsHeadingDto,
      );
      return await this.ticketsHeadingRepository.save(ticket);
    } catch (error) {
      throw new HttpException(
        `Error creating ticket: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{
    tickets: TicketsHeading[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      const [tickets, total] = await this.ticketsHeadingRepository
        .createQueryBuilder('ticket') // 'event' is the alias for your table/entity
        .skip(offset) // Number of rows to skip
        .take(limit) // Number of rows to fetch
        .getManyAndCount(); // Fetch entities and total count

      return { tickets, total, page, limit };
    } catch (error) {
      throw new HttpException(
        `Error fetching tickets: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<TicketsHeading | null> {
    try {
      const ticket = await this.ticketsHeadingRepository.findOne({
        where: { id: id },
      });
      if (!ticket) {
        throw new HttpException(
          `Ticket with id ${id} not found.`,
          HttpStatus.NOT_FOUND,
        );
      }

      return ticket;
    } catch (error) {
      throw new HttpException(
        `Error fetching ticket: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    ticket: TicketsHeading,
    user: any,
  ): Promise<TicketsHeading> {
    try {
      const ticketToBeUpdate = await this.findOne(id);

      const updatedTicket = Object.assign(ticketToBeUpdate, ticket);
      updatedTicket.update_by = user;
      updatedTicket.updated_at = new Date();

      return await this.ticketsHeadingRepository.save(updatedTicket);
    } catch (error) {
      throw new HttpException(
        `Error Updating Ticket: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async activate(
    id: string,
    status: string,
    user: any,
  ): Promise<TicketsHeading | null> {
    try {
      const ticket = await this.findOne(id);

      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }

      ticket.status = status;
      ticket.update_by = user;
      ticket.updated_at = new Date();

      try {
        await this.entityManager.query(
          `UPDATE tickets SET status = '${status}' WHERE ticket_heading_id = '${ticket.id}'`,
        );
      } catch (error) {
        throw new Error(`Error updating tickets: ${error.message}`);
      }

      return await this.ticketsHeadingRepository.save(ticket);
    } catch (error) {
      throw new HttpException(
        `Error Updating Ticket: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findHeadingsByEventId(eventId: string): Promise<TicketsHeading[]> {
    try {
      const ticketHeadings = await this.ticketsHeadingRepository.find({
        where: {
          event_id: {
            id: eventId,
          },
        },
        relations: ['event_id'],
      });

      return ticketHeadings;
    } catch (error) {
      throw new HttpException(
        `Error fetching ticket headings by event ID: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export class CreateTicketsDtoWithEventId extends CreateTicketsHeadingDto {
  event_id: IdValueObject;
}
