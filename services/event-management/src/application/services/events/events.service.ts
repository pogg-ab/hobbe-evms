import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Events } from 'src/domain/entities/events.entity';
import { CREATE_EVENT_REPOSITORY_TOKEN } from 'src/domain/repositories/events/event.repository.token';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { IEventRepository } from 'src/domain/repositories/events/event-repository';
import { CreateEventsDto } from 'src/presentation/dtos/events/create-events.dto';
import { UpdateEventsDto } from 'src/presentation/dtos/events/update-events.dto';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';

@Injectable()
export class EventsService {

    constructor(
        @Inject(CREATE_EVENT_REPOSITORY_TOKEN)
        private readonly createEventRepository: IEventRepository,
        @InjectMapper() private readonly mapper: Mapper,
        
    ) { }

    async create(createEventsDto:CreateEventsDto,user: any):Promise<Events>{
        const event = this.mapper.map(createEventsDto,CreateEventsDto, Events);
        return this.createEventRepository.create(event,user);
    }


   async findAll( page:number, limit:number):Promise<{events:Events[]|null, total: number; page: number; limit: number}>{
     return this.createEventRepository.findAll(page,limit);
    }

    async findOne(id:string):Promise<Events | null>{
        const event  = await this.createEventRepository.findOne(id);
        if(!event){
            throw new NotFoundException(`Event with id ${id} not found.`);
        }

        return event;
       }


       async findByCategory(category:string):Promise<Events[]>{
        const event  = await this.createEventRepository.findByCategory(category);
        if(!event){
            throw new NotFoundException(`Event with Category ${category} not found.`);
        }

        return event;
       }


       async findByLocation(location:string):Promise<Events[]>{
        const event  = await this.createEventRepository.findByLocation(location);
        if(!event){
            throw new NotFoundException(`Event with location ${location} not found.`);
        }

        return event;
       }


       async search(keyword: string, page:number, limit:number): Promise<{events:Events[] | null,total:number}> {
           const events = await this.createEventRepository.search(keyword,page,limit);
           if (!events) {
            throw new NotFoundException(`Event with keyword ${keyword} not found.`);
           }
           return events;
        }

       

       
    async update(id: string, updateEventsDto: UpdateEventsDto,user: any): Promise<Events>{
        const event = await this.findOne(id);
        const updatedEvent = this.mapper.map(updateEventsDto, UpdateEventsDto, Events);
        await this.createEventRepository.update(id, updatedEvent,user);
        return updatedEvent;
    }

    async delete(id: string): Promise<void>{
        await this.createEventRepository.delete(id);
    }
}
