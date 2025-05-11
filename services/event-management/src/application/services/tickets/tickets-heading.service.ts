import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CREATE_TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/tickets.repository.token';
import { ITicketsHeadingRepository } from 'src/domain/repositories/tickets/tickets-heading.repository';
import { CreateTicketsHeadingDto } from 'src/presentation/dtos/tickets/create-tickets-heading.dto';
import { TicketsHeading } from 'src/domain/entities/tickets-heading.entity';

@Injectable()
export class TicketsHeadingService{
    constructor(
        @Inject(CREATE_TICKET_REPOSITORY_TOKEN)
        private readonly ticketsHeadingRepository: ITicketsHeadingRepository,
        @InjectMapper() private readonly mapper: Mapper,
    ) { }

    async create(event_id:IdValueObject ,createTicketsHeadingDto:CreateTicketsHeadingDto):Promise<TicketsHeading>{
       const ticket = this.mapper.map(createTicketsHeadingDto,CreateTicketsHeadingDto,TicketsHeading);
        return await this.ticketsHeadingRepository.create(event_id,createTicketsHeadingDto)
    }

    async findAll(page: number, limit: number):Promise<{tickets:TicketsHeading[]| null,total: number; page: number; limit: number}>{
        return await this.ticketsHeadingRepository.findAll(page, limit);
    }

    async findOne(id:string):Promise<TicketsHeading | null>{
        return await this.ticketsHeadingRepository.findOne(id);
    }


    async update(id: string, ticket: TicketsHeading, user: any): Promise<TicketsHeading>{
        return await this.ticketsHeadingRepository.update(id, ticket, user);
    }


    async activate(id: string, status: string, user: any): Promise<TicketsHeading | null>{
        return await this.ticketsHeadingRepository.activate(id, status, user);
    }


}