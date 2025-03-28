import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventSponsor } from 'src/domain/entities/event-sponsor.entity';
import { IEventSponsorRepository } from 'src/domain/repositories/event-sponsor/event-sponsor.repository';
import { CreateEventSponsorDto } from 'src/presentation/dtos/event-sponsor/create-event-sponsor.dto';
import { Repository } from 'typeorm';

@Injectable()
export class EventSponsorRepositoryImpl implements IEventSponsorRepository {
  constructor(
    @InjectRepository(EventSponsor)
    private readonly eventSponsorRepository: Repository<EventSponsor>,
  ) { }

  async create(
    createEventSponsor: EventSponsor,
    user: any
  ): Promise<EventSponsor> {
    try {
      const newEventSponsor = this.eventSponsorRepository.create(createEventSponsor);
      newEventSponsor.created_by = user;
      return await this.eventSponsorRepository.save(newEventSponsor);
    } catch (error) {
      if (error.code === '23505') {
        throw new HttpException(
          `Event Sponsor with this data already exists: ${error.detail}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        `Error creating Event Sponsor: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<EventSponsor[]> {
    return this.eventSponsorRepository.find({
      relations: ['event_id']
    });
  }

  async findOne(id: string): Promise<EventSponsor | null> {
    try {
      const eventSponsor = await this.eventSponsorRepository.findOne({
        where: { event_sponsor_id: id },
        relations: ['event_id']
      });

      if (!eventSponsor) {
        throw new HttpException(
          `Event Sponsor with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return eventSponsor;
    } catch (error) {
      throw new HttpException(
        `Error fetching Event Sponsor with ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByEventId(eventId: string): Promise<EventSponsor[]> {
    try {

      const eventSponsors = await this.eventSponsorRepository
        .createQueryBuilder('eventSponsor')
        .leftJoinAndSelect('eventSponsor.event_id', 'event')
        .where('eventSponsor.event_id = :eventId', { eventId: eventId.toString() })
        .getMany();

      return eventSponsors;

    } catch (error) {
      if (error instanceof HttpException || error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        `Error fetching Event Sponsors for Event ID ${eventId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, eventSponsor: EventSponsor): Promise<EventSponsor> {
    try {
      const eventSponsorToUpdate = await this.findOne(id);
      const updatedEventSponsor = Object.assign(
        eventSponsorToUpdate,
        eventSponsor,
      );
      return await this.eventSponsorRepository.save(updatedEventSponsor);
    } catch (error) {
      throw new HttpException(
        `Error updating Event Sponsor: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const eventSponsor = await this.findOne(id);
      await this.eventSponsorRepository.delete(id);
    } catch (error) {
      throw new HttpException(
        `Error deleting Event Sponsor: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
