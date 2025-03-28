import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ConflictException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventSponsor } from 'src/domain/entities/event-sponsor.entity';
import { IEventSponsorRepository } from 'src/domain/repositories/event-sponsor/event-sponsor.repository';
import { EVENT_SPONSOR_REPOSITORY_TOKEN } from 'src/domain/repositories/event-sponsor/event-sponsor.repository.token';
import { IEventRepository } from 'src/domain/repositories/events/event-repository';
import { CREATE_EVENT_REPOSITORY_TOKEN } from 'src/domain/repositories/events/event.repository.token';
import { CreateEventSponsorDto } from 'src/presentation/dtos/event-sponsor/create-event-sponsor.dto';
import { UserInfoService } from '../user-info/user-info.service';

@Injectable()
export class EventSponsorService {
  constructor(
    @Inject(EVENT_SPONSOR_REPOSITORY_TOKEN)
    private readonly eventSponsorRepository: IEventSponsorRepository,
    @Inject(CREATE_EVENT_REPOSITORY_TOKEN)
    private readonly eventRepository: IEventRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly userInfoService: UserInfoService,
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
    const eventSponsors = await this.eventSponsorRepository.findAll();

    if (eventSponsors.length === 0) {
      return eventSponsors;
    }

    const userIds = [...new Set(eventSponsors.map(sponsor => sponsor.sponsor_user_id))];

    try {
      const userInfoResponse = await this.userInfoService.getUserInfo(userIds);

      return eventSponsors.map(sponsor => ({
        ...sponsor,
        userInfo: userInfoResponse[sponsor.sponsor_user_id] || null,
      }));
    } catch (error) {
      console.error('Failed to fetch sponsor info:', error);
      return eventSponsors.map(sponsor => ({
        ...sponsor,
        userInfo: null,
      }));
    }
  }

  async findOne(id: string): Promise<any | null> {
    const eventSponsor = await this.eventSponsorRepository.findOne(id);

    if (!eventSponsor) {
      return null;
    }

    try {
      const userInfoResponse = await this.userInfoService.getUserInfo([eventSponsor.sponsor_user_id]);
      return {
        ...eventSponsor,
        userInfo: userInfoResponse[eventSponsor.sponsor_user_id] || null,
      };
    } catch (error) {
      console.error('Failed to fetch sponsor info:', error);
      return {
        ...eventSponsor,
        userInfo: null,
      };
    }
  }

  async findByEventId(eventId: string): Promise<EventSponsor[]> {
    const eventSponsors = await this.eventSponsorRepository.findByEventId(eventId);

    if (eventSponsors.length === 0) {
      return eventSponsors;
    }

    const userIds = [...new Set(eventSponsors.map(sponsor => sponsor.sponsor_user_id))];

    try {
      const userInfoResponse = await this.userInfoService.getUserInfo(userIds);

      return eventSponsors.map(sponsor => ({
        ...sponsor,
        userInfo: userInfoResponse[sponsor.sponsor_user_id] || null,
      }));
    } catch (error) {
      console.error('Failed to fetch sponsor info:', error);
      return eventSponsors.map(sponsor => ({
        ...sponsor,
        userInfo: null,
      }));
    }
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
