import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Events } from 'src/domain/entities/events.entity';
import { CREATE_EVENT_REPOSITORY_TOKEN } from 'src/domain/repositories/events/event.repository.token';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { IEventRepository } from 'src/domain/repositories/events/event-repository';
import { CreateEventsDto } from 'src/presentation/dtos/events/create-events.dto';
import { UpdateEventsDto } from 'src/presentation/dtos/events/update-events.dto';

@Injectable()
export class EventsService {

    constructor(
        @Inject(CREATE_EVENT_REPOSITORY_TOKEN)
        private readonly createEventRepository: IEventRepository,
        @InjectMapper() private readonly mapper: Mapper,
        
    ) { }

    async create(createEventsDto:CreateEventsDto):Promise<Events>{
        const event = this.mapper.map(createEventsDto,CreateEventsDto, Events);
        return this.createEventRepository.create(event);
    }


   async findAll():Promise<Events[]>{
     return this.createEventRepository.findAll();
    }

    async findOne(id:string):Promise<Events | null>{
        const event  = await this.createEventRepository.findOne(id);
        if(!event){
            throw new NotFoundException(`Event with id ${id} not found.`);
        }

        return event;
       }


    async update(id: string, updateEventsDto: UpdateEventsDto): Promise<Events>{
        const event = await this.findOne(id);
        const updatedEvent = this.mapper.map(updateEventsDto, UpdateEventsDto, Events);
        await this.createEventRepository.update(id, updatedEvent);
        return updatedEvent;
    }

    async delete(id: string): Promise<void>{
        await this.createEventRepository.delete(id);
    }
}
