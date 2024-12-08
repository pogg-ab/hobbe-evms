import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { Inject } from "@nestjs/common";
import { Tickets } from "src/domain/entities/tickets.entity";
import { CREATE_EVENT_REPOSITORY_TOKEN } from "src/domain/repositories/events/event.repository.token";
import { ITicketsRepository } from "src/domain/repositories/tickets/tickets.repository";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";
import { CreateTicketsDto } from "src/presentation/dtos/tickets/create-tickets.dto";


export class TicketsService{
    constructor(
        @Inject(CREATE_EVENT_REPOSITORY_TOKEN)
        private readonly ticketsRepository: ITicketsRepository,
        @InjectMapper() 
        private readonly mapper: Mapper,

    ) { }

    async create(event_id:IdValueObject ,createTicketsDto:CreateTicketsDto):Promise<Tickets>{
       const ticket = this.mapper.map(createTicketsDto,CreateTicketsDto,Tickets);
        return await this.ticketsRepository.create(event_id,createTicketsDto)
    }
}