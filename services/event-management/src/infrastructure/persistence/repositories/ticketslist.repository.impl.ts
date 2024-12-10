import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketsList } from 'src/domain/entities/tickets_list.entity';
import { ITicketsListRepository } from 'src/domain/repositories/tickets/tickets-list.repository';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CreateTicketsListDto } from 'src/presentation/dtos/tickets/create-tickets-list.dto';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TicketsListRepositoryEmpl implements ITicketsListRepository {
  constructor(
    @InjectRepository(TicketsList)
    private ticketsListRepository: Repository<TicketsList>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createTicketsListDto: CreateTicketsListDto,
  ): Promise<void> {
    try {
      const newTicket = this.ticketsListRepository.create(createTicketsListDto);
       await this.ticketsListRepository.save(newTicket);
    } catch (error) {
      throw new HttpException(
        `Error creating Ticket: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<TicketsList | null> {
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
    ticketsList: TicketsList[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      // return await this.eventRepository.find();

      const offset = (page - 1) * limit; // Calculate the offset

      // Use QueryBuilder to handle pagination
      const [ticketsList, total] = await this.ticketsListRepository
        .createQueryBuilder('event') // 'event' is the alias for your table/entity
        .skip(offset) // Number of rows to skip
        .take(limit) // Number of rows to fetch
        .getManyAndCount(); // Fetch entities and total count

      return { ticketsList, total, page, limit };
    } catch (error) {
      throw new HttpException(
        `Error fetching Events: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEventsAllTicketsList(
    ticket_id: IdValueObject,
  ): Promise<TicketsList[] | null> {
    try {
      // Use 'find' instead of 'findBy'
      const data = `SELECT * FROM tickets_list
      WHERE ticket_id = '${ticket_id}'`;
      const tickets = this.dataSource.query(data);
      // Check if no events were found

      return tickets;
    } catch (error) {
      console.error('Error fetching tickets list:', error);
      throw new HttpException(
        `Error fetching Tickets List with Tickets id ${ticket_id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
