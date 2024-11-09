import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Events } from 'src/domain/entities/events.entity';
import { ICreateEventRepository } from 'src/domain/repositories/create-event-repository';
import { Repository } from 'typeorm';
@Injectable()
export class EventRepositoryEmpl implements ICreateEventRepository {
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
}
