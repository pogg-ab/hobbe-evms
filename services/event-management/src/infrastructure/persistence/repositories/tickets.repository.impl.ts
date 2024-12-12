import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { ITicketsRepository } from 'src/domain/repositories/tickets/tickets.repository';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TicketsRepositoryEmpl implements ITicketsRepository {
  constructor(
    @InjectRepository(Tickets)
    private ticketsRepository: Repository<Tickets>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    event_id: IdValueObject,
    createTicketsDto: CreateTicketsDto,
  ): Promise<Tickets> {
    try {
      const ticket = this.ticketsRepository.create(createTicketsDto);
      return await this.ticketsRepository.save(ticket);
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
    tickets: Tickets[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      const [tickets, total] = await this.ticketsRepository
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

  async findOne(id: string): Promise<Tickets | null> {
    try{
      const ticket =  await this.ticketsRepository.findOne({ where: { id: id } });
      if(!ticket){
        throw new HttpException(`Ticket with id ${id} not found.`, HttpStatus.NOT_FOUND);
      }

      return ticket;
    }catch(error){
      throw new HttpException(
        `Error fetching ticket: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async update(id: string, ticket: Tickets, user: any): Promise<Tickets> {
    try {
      const ticketToBeUpdate = await this.findOne(id);

      const updatedTicket = Object.assign(ticketToBeUpdate, ticket);
      updatedTicket.update_by = user;
      updatedTicket.updated_at = new Date();

      return await this.ticketsRepository.save(updatedTicket);
    } catch (error) {
      throw new HttpException(
        `Error Updating Ticket: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}



export class CreateTicketsDtoWithEventId extends CreateTicketsDto {
  event_id: IdValueObject;
}
