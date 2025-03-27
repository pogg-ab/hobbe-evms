import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ConflictException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
    user: any
  ): Promise<any> {
    const { event_id, sponsor_user_id } = createEventSponsorDto;

    const event = await this.eventRepository.findOne(event_id.toString());
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    let eventSponsors: EventSponsor[] = [];
    try {
      eventSponsors = await this.eventSponsorRepository.findByEventId(event_id.toString());
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === HttpStatus.NOT_FOUND) {
        eventSponsors = [];
      } else {
        throw error;
      }
    }

    const isAlreadyConnected = sponsor_user_id.some(id =>
      eventSponsors.some(sponsor => sponsor.sponsor_user_id === id)
    );
    if (isAlreadyConnected) {
      throw new ConflictException('One or more sponsors are already connected to the event.');
    }

    const eventSponsorsToCreate = sponsor_user_id.map(id => {
      return this.mapper.map(
        { ...createEventSponsorDto, sponsor_user_id: [id] },
        CreateEventSponsorDto,
        EventSponsor
      );
    });

    const createdSponsors = await Promise.all(
      eventSponsorsToCreate.map(eventSponsor =>
        this.eventSponsorRepository.create(eventSponsor, user)
      )).then(results => results);

    return {
      success: true,
      message: `Successfully added ${sponsor_user_id.length} sponsor(s) to the event`,
      data: createdSponsors
    };
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
