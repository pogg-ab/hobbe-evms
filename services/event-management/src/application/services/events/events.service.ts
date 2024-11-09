import { Inject, Injectable } from '@nestjs/common';
import { Events } from 'src/domain/entities/events.entity';
import { ICreateEventRepository } from 'src/domain/repositories/create-event-repository';
import { CREATE_EVENT_REPOSITORY_TOKEN } from 'src/domain/repositories/create-event.repository.token';
import { CreateEventsDto } from 'src/presentation/dtos/create-events.dto';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';

@Injectable()
export class EventsService {

    constructor(
        @Inject(CREATE_EVENT_REPOSITORY_TOKEN)
        private readonly createEventRepository: ICreateEventRepository,
        @InjectMapper() private readonly mapper: Mapper,
        
    ) { }

    async create(createEventsDto:CreateEventsDto):Promise<Events>{
        const event = this.mapper.map(createEventsDto,CreateEventsDto, Events);
        return this.createEventRepository.create(event);
    }


   async findAll():Promise<Events[]>{
     return this.createEventRepository.findAll();
    }
}
