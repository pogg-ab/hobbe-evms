import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { EventSponsor } from 'src/domain/entities/event-sponsor.entity';
import { IEventSponsorRepository } from 'src/domain/repositories/event-sponsor/event-sponsor.repository';
import { EVENT_SPONSOR_REPOSITORY_TOKEN } from 'src/domain/repositories/event-sponsor/event-sponsor.repository.token';
import { IEventRepository } from 'src/domain/repositories/events/event-repository';
import { CREATE_EVENT_REPOSITORY_TOKEN } from 'src/domain/repositories/events/event.repository.token';
import { CreateEventSponsorDto } from 'src/presentation/dtos/event-sponsor/create-event-sponsor.dto';

@Injectable()
export class EventSponsorService {
  constructor(
    @Inject(EVENT_SPONSOR_REPOSITORY_TOKEN)
    private readonly eventSponsorRepository: IEventSponsorRepository,
    @Inject(CREATE_EVENT_REPOSITORY_TOKEN)
    private readonly eventRepository: IEventRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) { }

  async create(
    createEventSponsorDto: CreateEventSponsorDto,
  ): Promise<EventSponsor> {
    const event = await this.eventRepository.findOne(
      createEventSponsorDto.event_id,
    );
    if (!event) {
      throw new Error('Event not found');
    }
    const eventSponsor = this.mapper.map(
      createEventSponsorDto,
      CreateEventSponsorDto,
      EventSponsor,
    );
    return this.eventSponsorRepository.create(eventSponsor);
  }

  async findAll(): Promise<EventSponsor[]> {
    return this.eventSponsorRepository.findAll();
  }

  async findOne(id: string): Promise<EventSponsor | null> {
    return this.eventSponsorRepository.findOne(id);
  }

  async findByEventId(eventId: string): Promise<EventSponsor[]> {
    return this.eventSponsorRepository.findByEventId(eventId);
  }

  async update(
    id: string,
    createEventSponsorDto: CreateEventSponsorDto,
  ): Promise<EventSponsor> {
    const updatedEventSponsor = this.mapper.map(
      createEventSponsorDto,
      CreateEventSponsorDto,
      EventSponsor,
    );
    return this.eventSponsorRepository.update(id, updatedEventSponsor);
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.eventSponsorRepository.delete(id);
    return { message: 'Event Sponsor Deleted!' };
  }
}
