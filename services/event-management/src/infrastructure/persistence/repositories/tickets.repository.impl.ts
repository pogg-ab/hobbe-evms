


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
  ) {

  }

  

  async create(event_id:IdValueObject,createTicketsDto: CreateTicketsDto): Promise<Tickets> {
    try {
      const ticket = this.ticketsRepository.create(createTicketsDto);
      return  await this.ticketsRepository.save(ticket);

    } catch (error) {
      throw new HttpException(
        `Error creating ticket: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }



}


export class CreateTicketsDtoWithEventId extends CreateTicketsDto {
    event_id: IdValueObject;
}
