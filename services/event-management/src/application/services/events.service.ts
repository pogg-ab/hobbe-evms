import { Injectable } from '@nestjs/common';
import { UserCreatedEvent } from 'src/domain/events/user-created.event';
import { CreateEventDto } from 'src/presentation/dtos/create-event.dto';
import { UpdateEventDto } from 'src/presentation/dtos/update-event.dto';

@Injectable()
export class EventsService {
  create(createEventDto: CreateEventDto) {
    return 'This action adds a new event';
  }

  handleUserCreated(userCreatedEvent: UserCreatedEvent) {
    console.log(userCreatedEvent);
    return userCreatedEvent;
  }

  findAll() {
    let events = [];
    return `This action returns all events`;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
