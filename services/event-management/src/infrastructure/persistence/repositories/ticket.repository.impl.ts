import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketsList } from 'src/domain/entities/tickets_list.entity';
import { ITicketsListRepository } from 'src/domain/repositories/tickets/tickets-repository';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CreateTicketsListDto } from 'src/presentation/dtos/tickets/create-tickets-list.dto';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TicketsRepositoryEmpl implements ITicketsListRepository {

  constructor(
    @InjectRepository(TicketsList)
    private ticketsListRepository: Repository<TicketsList>,
    private readonly dataSource: DataSource,
  ) {

  }

  

  async create(createTicketsListDto: CreateTicketsListDto): Promise<TicketsList> {
    try {
      const newTicket = this.ticketsListRepository.create(createTicketsListDto);
     
      return  await this.ticketsListRepository.save(newTicket);

    } catch (error) {
      throw new HttpException(
        `Error creating Ticket: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async getAllTicketsList(ticket_id: IdValueObject): Promise<TicketsList[] | null> {
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
