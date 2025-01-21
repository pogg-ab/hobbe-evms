import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Events } from 'src/domain/entities/events.entity';
import { CREATE_EVENT_REPOSITORY_TOKEN } from 'src/domain/repositories/events/event.repository.token';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { IEventRepository } from 'src/domain/repositories/events/event-repository';
import { CreateEventsDto } from 'src/presentation/dtos/events/create-events.dto';
import { UpdateEventsDto } from 'src/presentation/dtos/events/update-events.dto';
import { CreateTicketsCommand } from 'src/application/commands/ticket/create-tickets.command';
import { CustomEventTicketMapper } from 'src/application/mappers/event-tickets.mapper';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { CommandBus } from '@nestjs/cqrs';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer.servicce';
import {
  endOfDay,
  format,
  nextSaturday,
  nextSunday,
  startOfDay,
} from 'date-fns';
import { SocketIo } from 'src/infrastructure/socket-io/socket.gateway';

@Injectable()
export class EventsService {
  constructor(
    @Inject(CREATE_EVENT_REPOSITORY_TOKEN)
    private readonly createEventRepository: IEventRepository,
    @InjectMapper() private readonly mapper: Mapper,
    public readonly createTicketsDto: CreateTicketsDto,
    private readonly commandBus: CommandBus,
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly socket: SocketIo
  ) { }



  async create(createEventsDto: CreateEventsDto, user: any): Promise<Events> {
    const mappedEvent = this.mapper.map(
      createEventsDto,
      CreateEventsDto,
      Events,
    );
    const event = await this.createEventRepository.create(mappedEvent, user);

    const accounts = createEventsDto.bank_accounts;
    if (accounts) {
      accounts.forEach((account) => {
        (account as any).event_id = event.id; // Add event_id property
      });
      this.kafkaProducerService.produce({
        topic: 'bank-account-list-sent',
        messages: [{ value: JSON.stringify(accounts) }],
      });
    }
    if (event.ticket_heading) {
      for (let i = 0; i < event.ticket_heading.quantity; i++) {
        const ticketDto = await new CustomEventTicketMapper().map(
          event,
          this.createTicketsDto,
          'Regular',
        );
        const command = new CreateTicketsCommand(ticketDto);
        await this.commandBus.execute(command);
      }

      for (let i = 0; i < event.ticket_heading.vip_quantity; i++) {
        const ticketDto = await new CustomEventTicketMapper().map(
          event,
          this.createTicketsDto,
          'VIP',
        );
        const command = new CreateTicketsCommand(ticketDto);
        await this.commandBus.execute(command);
      }

      for (let i = 0; i < event.ticket_heading.vvip_quantity; i++) {
        const ticketDto = await new CustomEventTicketMapper().map(
          event,
          this.createTicketsDto,
          'VVIP',
        );
        const command = new CreateTicketsCommand(ticketDto);
        await this.commandBus.execute(command);
      }
    }

    return event;
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
    return this.createEventRepository.findAll(page, limit);
  }

  async findOne(id: string): Promise<Events | null> {
    const event = await this.createEventRepository.findOne(id);
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found.`);
    }
    return event;
  }

  async findByUser(user: string): Promise<Events[]> {
    const event = await this.createEventRepository.findByUser(user);
    if (!event) {
      throw new NotFoundException(`Event with Category ${user} not found.`);
    }
    return event;
  }

  async findByCategory(category: string): Promise<Events[]> {
    const event = await this.createEventRepository.findByCategory(category);
    if (!event) {
      throw new NotFoundException(`Event with Category ${category} not found.`);
    }
    return event;
  }

  async findByLocation(location: string): Promise<Events[]> {
    const event = await this.createEventRepository.findByLocation(location);
    if (!event) {
      throw new NotFoundException(`Event with location ${location} not found.`);
    }
    return event;
  }

  async findByOrganiser(organiser: string): Promise<Events[]> {
    const event = await this.createEventRepository.findByOrganiser(organiser);
    if (!event) {
      throw new NotFoundException(
        `Event with organiser ${location} not found.`,
      );
    }
    return event;
  }

  async search(
    keyword: string,
    page: number,
    limit: number,
  ): Promise<{ events: Events[] | null; total: number }> {
    const events = await this.createEventRepository.search(
      keyword,
      page,
      limit,
    );
    if (!events) {
      throw new NotFoundException(`Event with keyword ${keyword} not found.`);
    }
    return events;
  }

  async update(
    id: string,
    updateEventsDto: UpdateEventsDto,
    user: any,
  ): Promise<Events> {
    await this.findOne(id);
    const updatedEvent = this.mapper.map(
      updateEventsDto,
      UpdateEventsDto,
      Events,
    );
    console.log(updatedEvent);

    await this.createEventRepository.update(id, updatedEvent, user);
    return updatedEvent;
  }

  async findBySpecificDate(date: Date): Promise<Events[] | []> {
    const start_of_day = startOfDay(date);
    const end_of_day = endOfDay(date);
    return await this.createEventRepository.findByDateRange(
      start_of_day,
      end_of_day,
    );
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Events[] | []> {
    const start_of_day = startOfDay(startDate);
    const end_of_day = endOfDay(endDate);
    return await this.createEventRepository.findByDateRange(
      start_of_day,
      end_of_day,
    );
  }

  async findByThisWeek(): Promise<Events[] | []> {
    const weekend = await this.getWeekend();
    return await this.createEventRepository.findByDateRange(
      weekend.saturday,
      weekend.sunday,
    );
  }

  async delete(id: string): Promise<void> {
    await this.createEventRepository.delete(id);
  }

  async getWeekend() {
    const date = new Date();
    const saturday = startOfDay(nextSaturday(date)); // Gets the next Saturday from the given date
    const sunday = endOfDay(nextSunday(saturday)); // Gets the next Sunday from Saturday

    return { saturday, sunday };
  }

  async countMyEvent(user: string): Promise<any> {
    return this.createEventRepository.countMyEvents(user)
  }

  async singleEventAnalytics(user: string, event: string): Promise<any> {
    return this.createEventRepository.singleEventAnalytics(user, event);
  }


  async calculateEventRemainingTime(event: Events): Promise<string> {
    const event_id = event.id.toString();
    const targetDate = new Date(event.event_start_date);
    const endDate = new Date(event.event_end_date);
    const currentDate = new Date();

    if (currentDate >= endDate) {
      this.socket.handleEventRemainingTime({ event_id, remainingTime: 'Event Ended' });
      return 'Event Ended';
    }

    if (currentDate >= targetDate) {
      this.socket.handleEventRemainingTime({ event_id, remainingTime: 'Event Started' });
      return 'Event Started';
    }

    return new Promise((resolve) => {
      const countdownInterval = setInterval(() => {
        const remainingTimeMs = targetDate.getTime() - new Date().getTime();

        if (remainingTimeMs <= 0) {
          clearInterval(countdownInterval);
          this.socket.handleEventRemainingTime({ event_id, remainingTime: 'Event Started' });
          resolve('Event Started');
        } else {
          const days = Math.floor(remainingTimeMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor((remainingTimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((remainingTimeMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remainingTimeMs % (1000 * 60)) / 1000);

          const remainingTime = `${days}D: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

          this.socket.handleEventRemainingTime({ event_id, remainingTime });
        }
      }, 1000);
    });
  }



    async update(id: string, updateEventsDto: UpdateEventsDto): Promise<Events> {
        const event = await this.findOne(id);
        const updatedEvent = this.mapper.map(updateEventsDto, UpdateEventsDto, Events);
        await this.createEventRepository.update(id, updatedEvent);
        return updatedEvent;
    }

    async delete(id: string): Promise<void> {
        await this.createEventRepository.delete(id);
    }
}
