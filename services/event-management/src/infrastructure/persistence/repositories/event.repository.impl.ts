import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Events } from 'src/domain/entities/events.entity';
import { IEventRepository } from 'src/domain/repositories/events/event-repository';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { Repository } from 'typeorm';

@Injectable()
export class EventRepositoryEmpl implements IEventRepository {
  constructor(
    @InjectRepository(Events)
    private eventRepository: Repository<Events>,
    public readonly createTicketsDto: CreateTicketsDto,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(event: Events, user: any): Promise<Events> {
    try {
      const newEvent = this.eventRepository.create(event);
      newEvent.user_id = user;
      newEvent.created_by = user;
      newEvent.created_at = new Date();
      const storedEvent = await this.eventRepository.save(newEvent);

      return storedEvent;
    } catch (error) {
      throw new HttpException(
        `Error creating Event: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      // return await this.eventRepository.find();

      const offset = (page - 1) * limit; // Calculate the offset

      // Use QueryBuilder to handle pagination
      const [events, total] = await this.eventRepository
        .createQueryBuilder('event') // 'event' is the alias for your table/entity
        .skip(offset) // Number of rows to skip
        .take(limit) // Number of rows to fetch
        .getManyAndCount(); // Fetch entities and total count

      return { events, total, page, limit };
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
        // relations: ['promocodes','bank_accounts','ticket_heading.tickets','tickets'],
        relations: ['promocodes','bank_accounts','ticket_heading.tickets'],
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

  async findByUser(user: string): Promise<Events[]> {
    try {
      const events = await this.eventRepository.find({
        where: { user_id: user},
      });

      // Check if no events were found
      if (events.length === 0) {
        throw new HttpException(
          `Events with user ${user} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return events;
    } catch (error) {
      throw new HttpException(
        `Error fetching events with user ${user}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByCategory(category: string): Promise<Events[]> {
    try {
      const events = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.categories @> :category', {
        category: [category],  // Pass category as an array
      })
      .getMany();

      // Check if no events were found
      if (events.length === 0) {
        throw new HttpException(
          `Events with category ${category} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return events;
    } catch (error) {
      throw new HttpException(
        `Error fetching events with category ${category}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByLocation(location: string): Promise<Events[]> {
    try {
      // Use 'find' instead of 'findBy'
      const events = await this.eventRepository.find({
        where: { location: location },
      });

      // Check if no events were found
      if (events.length === 0) {
        throw new HttpException(
          `Events with category ${location} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return events;
    } catch (error) {
      throw new HttpException(
        `Error fetching events with location ${location}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }



  async findByOrganiser(organiser: string): Promise<Events[]> {
    try {
      // Use 'find' instead of 'findBy'
      const events = await this.eventRepository.find({
        where: { user_id: organiser },
      });

      // Check if no events were found
      if (events.length === 0) {
        throw new HttpException(
          `Events with organiser ${organiser} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return events;
    } catch (error) {
      throw new HttpException(
        `Error fetching events with organiser ${organiser}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async search(
    keyword: string,
    page: number,
    limit: number,
  ): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      const [events, total] = await this.eventRepository

        .createQueryBuilder('event')
        .where('LOWER(event.title) LIKE LOWER(:keyword)', {
          keyword: `%${keyword}%`,
        })
        .orWhere('LOWER(event.location) LIKE LOWER(:keyword)', {
          keyword: `%${keyword}%`,
        })
        // .orWhere('LOWER(event.category) LIKE LOWER(:keyword)', {
        //   keyword: `%${keyword}%`,
        // })
        .orWhere('LOWER(event.description) LIKE LOWER(:keyword)', {
          keyword: `%${keyword}%`,
        })
        
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      // find({
      //   where: [
      //     { title: Like(`%${keyword}%`) },
      //     { location: Like(`%${keyword}%`) },
      //     { category: Like(`%${keyword}%`) },
      //     { description: Like(`%${keyword}%`) },
      //   ],});

      if (events.length === 0) {
        throw new HttpException(
          `Events with keyword ${keyword} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return { events, total: total, page: page, limit: limit };
    } catch (error) {
      throw new HttpException(
        `Error fetching events with keyword ${keyword}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, event: Events, user: any): Promise<Events> {
    try {
      const eventToBeUpdate = await this.findOne(id);

      const updatedAccount = Object.assign(eventToBeUpdate, event);
      updatedAccount.update_by = user;
      updatedAccount.updated_at = new Date();

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
     
      await this.eventRepository.delete(id);
    } catch (error) {
      throw new HttpException(
        `Error deleting Event: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
