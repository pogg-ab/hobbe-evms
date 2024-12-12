import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CREATE_TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/tickets.repository.token';
import { ITicketsRepository } from 'src/domain/repositories/tickets/tickets.repository';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { Tickets } from 'src/domain/entities/tickets.entity';

@Injectable()
export class TicketsService{
    constructor(
        @Inject(CREATE_TICKET_REPOSITORY_TOKEN)
        private readonly ticketsRepository: ITicketsRepository,
        @InjectMapper() private readonly mapper: Mapper,
    ) { }

    async create(event_id:IdValueObject ,createTicketsDto:CreateTicketsDto):Promise<Tickets>{
       const ticket = this.mapper.map(createTicketsDto,CreateTicketsDto,Tickets);
        return await this.ticketsRepository.create(event_id,createTicketsDto)
    }

    async findAll(page: number, limit: number):Promise<{tickets:Tickets[]| null,total: number; page: number; limit: number}>{
        return await this.ticketsRepository.findAll(page, limit);
    }

    async findOne(id:string):Promise<Tickets | null>{
        return await this.ticketsRepository.findOne(id);
    }


    async update(id: string, ticket: Tickets, user: any): Promise<Tickets>{
        return await this.ticketsRepository.update(id, ticket, user);
    }


}