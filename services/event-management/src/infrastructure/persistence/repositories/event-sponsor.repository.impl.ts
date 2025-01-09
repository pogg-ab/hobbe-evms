import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
  ) {}

  async create(
    createEventSponsorDto: CreateEventSponsorDto,
  ): Promise<EventSponsor> {
    return this.eventSponsorRepository.save(createEventSponsorDto);
  }

  async findAll(): Promise<EventSponsor[]> {
    return this.eventSponsorRepository.find();
  }

  async findOne(id: string): Promise<EventSponsor | null> {
    try {
      const eventSponsor = await this.eventSponsorRepository.findOne({
        where: { event_sponsor_id: id },
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
      const eventSponsors = await this.eventSponsorRepository.find({
        where: { event_id: eventId },
      });

      if (!eventSponsors.length) {
        throw new HttpException(
          `No Event Sponsors found for Event ID ${eventId}`,
          HttpStatus.NOT_FOUND,
        );
      }
      return eventSponsors;
    } catch (error) {
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
