import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { ITicketsRepository } from 'src/domain/repositories/tickets/tickets.repository';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { TICKETS_LIST_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/ticketslist.repository.token';

@Injectable()
export class TicketsService {
  constructor(
    @Inject(TICKETS_LIST_REPOSITORY_TOKEN)
    private readonly createTicketsRepository: ITicketsRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async create(createTicketsDto: CreateTicketsDto): Promise<void> {
    const tickets = this.mapper.map(
      createTicketsDto,
      CreateTicketsDto,
      Tickets,
    );
    await this.createTicketsRepository.create(tickets);
  }

  async getEventsAllTicketsList(ticket_id: IdValueObject) {
    return this.createTicketsRepository.getEventsAllTicketsList(ticket_id);
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
    return this.createTicketsRepository.findAll(page, limit);
  }

  async findAllByTicketsHeading(
    ticket_heading_id :string,
    tickets_type?:string,
    status?:string
   
  ): Promise<{
    tickets: Tickets[] | null;
 
  }> {
    return this.createTicketsRepository.findAllByTicketsHeading(ticket_heading_id,tickets_type,status);
  }


  async findAllByTicketsEvents(
    event_id :string,
   
  ): Promise<{
    tickets: Tickets[] | null;
 
  }> {
    return this.createTicketsRepository.findAllByTicketsHeading(event_id);
  }

  async findOne(id: string): Promise<Tickets | null> {
    const ticket = await this.createTicketsRepository.findOne(id);
    if (!ticket) {
      throw new NotFoundException(`Event with id ${id} not found.`);
    }
    return ticket;
  }
  

  //        async findByCategory(category:string):Promise<Events[]>{
  //         const event  = await this.createEventRepository.findByCategory(category);
  //         if(!event){
  //             throw new NotFoundException(`Event with Category ${category} not found.`);
  //         }

  //         return event;
  //        }

  //        async findByLocation(location:string):Promise<Events[]>{
  //         const event  = await this.createEventRepository.findByLocation(location);
  //         if(!event){
  //             throw new NotFoundException(`Event with location ${location} not found.`);
  //         }

  //         return event;
  //        }

  //        async search(keyword: string, page:number, limit:number): Promise<{events:Events[] | null,total:number}> {
  //            const events = await this.createEventRepository.search(keyword,page,limit);
  //            if (!events) {
  //             throw new NotFoundException(`Event with keyword ${keyword} not found.`);
  //            }
  //            return events;
  //         }

  //     async update(id: string, updateEventsDto: UpdateEventsDto,user: any): Promise<Events>{
  //         const event = await this.findOne(id);
  //         const updatedEvent = this.mapper.map(updateEventsDto, UpdateEventsDto, Events);
  //         await this.createEventRepository.update(id, updatedEvent,user);
  //         return updatedEvent;
  //     }

  //     async delete(id: string): Promise<void>{
  //         await this.createEventRepository.delete(id);
  //     }
}
