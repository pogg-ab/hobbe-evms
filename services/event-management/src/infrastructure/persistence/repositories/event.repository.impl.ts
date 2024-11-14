import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Events } from 'src/domain/entities/events.entity';
import { IEventRepository } from 'src/domain/repositories/events/event-repository';
import { Repository } from 'typeorm';
@Injectable()
export class EventRepositoryEmpl implements IEventRepository {
  constructor(
    @InjectRepository(Events)
    private eventRepository: Repository<Events>,
  ) {}

  async create(user: Events): Promise<Events> {
    try {
      const newUser = this.eventRepository.create(user);
      return await this.eventRepository.save(newUser);
    } catch (error) {
      throw new HttpException(
        `Error creating Event: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async findAll(): Promise<Events[]> {
    try {
      return await this.eventRepository.find();
    } catch (error) {
      throw new HttpException(
        `Error fetching Events: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<Events | null> {
    try {
      const event = await this.eventRepository.findOne({
        where: { id: id },
      });
      if (!event) {
        throw new HttpException(
          `Event with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return event;
    } catch (error) {
      throw new HttpException(
        `Error fetching Event with ID ${id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    event: Events,
  ): Promise<Events> {
    try {
      const eventToBeUpdate = await this.findOne(id);
      if (!event) {
        throw new HttpException(
          `Event with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedAccount = Object.assign(eventToBeUpdate, event);

      return await this.eventRepository.save(updatedAccount);
    } catch (error) {
      throw new HttpException(
        `Error updating Event: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const eventToDelete = await this.findOne(id);
      if (!eventToDelete) {
        throw new HttpException(
          `Event with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.eventRepository.delete(id);
    } catch (error) {
      throw new HttpException(
        `Error deleting Event: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
