import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { endOfDay, nextSaturday, nextSunday, startOfDay } from 'date-fns';
import { CreateTicketsCommand } from 'src/application/commands/ticket/create-tickets.command';
import { CustomEventTicketMapper } from 'src/application/mappers/event-tickets.mapper';
import { Events } from 'src/domain/entities/events.entity';
import { IEventRepository } from 'src/domain/repositories/events/event-repository';
import { CREATE_EVENT_REPOSITORY_TOKEN } from 'src/domain/repositories/events/event.repository.token';
import { ITicketsRepository } from 'src/domain/repositories/tickets/tickets.repository';
import { CREATE_TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/tickets.repository.token';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer.servicce';
import { SocketIo } from 'src/infrastructure/socket-io/socket.gateway';
import { CreateEventsDto } from 'src/presentation/dtos/events/create-events.dto';
import { UpdateEventsDto } from 'src/presentation/dtos/events/update-events.dto';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { DataSource } from 'typeorm';
import { UserInfoService } from '../user-info/user-info.service';
import { StreamProducerService } from 'src/infrastructure/kafka/stream.producer.service';
import { CreateStreamDto } from 'src/presentation/dtos/live-stream/create-stream.dto';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { FilterEventsDto } from 'src/presentation/dtos/events/filter-events.dto';
import { TicketSalesOverviewResponseDto } from 'src/presentation/dtos/events/ticket-sales-overview-response.dto';

@Injectable()
export class EventsService {
  constructor(
    @Inject(CREATE_EVENT_REPOSITORY_TOKEN)
    private readonly createEventRepository: IEventRepository,
    @Inject(CREATE_TICKET_REPOSITORY_TOKEN)
    private readonly ticketRepository: ITicketsRepository,
    @InjectMapper() private readonly mapper: Mapper,
    public readonly createTicketsDto: CreateTicketsDto,
    private readonly commandBus: CommandBus,
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly socket: SocketIo,
    private dataSource: DataSource,
    private readonly userInfoService: UserInfoService,
    private readonly streamProducerService: StreamProducerService,
  ) {}

  private createStream(user: string, event_id: IdValueObject): any {
    const stream = {
      userId: user,
      eventId: event_id,
    };
    return stream;
  }

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
        (account as any).event_id = event.id;
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

    if (event.location == 'Live') {
      const stream = this.createStream(user, event.id);

      await this.streamProducerService.sendStreamToKafka(stream);
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
    const result = await this.createEventRepository.findAll(page, limit);

    if (!result.events || result.events.length === 0) {
      return result;
    }

    // Get all user IDs for organizer info
    const userIds = result.events.map((event) => event.user_id);
    let userInfoResponse = {};

    try {
      userInfoResponse = await this.userInfoService.getUserInfo(userIds);
    } catch (userInfoError) {
      console.error('Failed to fetch organizer info:', userInfoError);
    }

    const enrichedEvents = result.events.map((event) => ({
      ...event,
      organizerInfo: userInfoResponse[event.user_id] || null,
    }));

    return {
      ...result,
      events: enrichedEvents,
    };
  }

  async findAllByAuth(
    user: string,
    page: number,
    limit: number,
  ): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.createEventRepository.findAllByAuth(
      user,
      page,
      limit,
    );

    if (!result.events || result.events.length === 0) {
      return result;
    }

    const userIds = result.events.map((event) => event.user_id);
    let userInfoResponse = {};

    try {
      userInfoResponse = await this.userInfoService.getUserInfo(userIds);
    } catch (userInfoError) {
      console.error('Failed to fetch organizer info:', userInfoError);
    }

    const enrichedEvents = result.events.map((event) => ({
      ...event,
      organizerInfo: userInfoResponse[event.user_id] || null,
    }));

    return {
      ...result,
      events: enrichedEvents,
    };
  }

  async findFiltered(filterEventsDto: FilterEventsDto): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result =
      await this.createEventRepository.findFiltered(filterEventsDto);
    if (!result.events || result.events.length === 0) {
      return result;
    }

    const userIds = result.events.map((event) => event.user_id);
    let userInfoResponse = {};
    try {
      userInfoResponse = await this.userInfoService.getUserInfo(userIds);
    } catch (userInfoError) {
      console.error('Failed to fetch organizer info:', userInfoError);
    }

    const enrichedEvents = result.events.map((event) => ({
      ...event,
      organizerInfo: userInfoResponse[event.user_id] || null,
    }));

    return {
      ...result,
      events: enrichedEvents,
    };
  }

  async findOne(id: string): Promise<Events | null> {
    const SERVICE_CHARGE_RATE = 0.03;
    const SALES_TAX_RATE = 0.1;
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.startTransaction();

      const event = await this.createEventRepository.findOne(id);
      if (!event) {
        throw new NotFoundException(`Event with id ${id} not found.`);
      }

      const allTicketsCounter =
        await this.ticketRepository.countAllTicketsForEvent(
          queryRunner.manager,
          id,
        );

      await this.notifyLiveTicketPurchaseCounter(allTicketsCounter, id);
      const calculatePricing = (price: number | null) => {
        if (!price) return null;

        const basePrice = parseFloat(
          (price / (1 + SERVICE_CHARGE_RATE + SALES_TAX_RATE)).toFixed(1),
        );
        const serviceCharge = parseFloat(
          (basePrice * SERVICE_CHARGE_RATE).toFixed(1),
        );
        const salesTax = parseFloat((basePrice * SALES_TAX_RATE).toFixed(1));

        return {
          basePrice,
          serviceCharge,
          salesTax,
          totalPrice: price,
          serviceChargeRate: (SERVICE_CHARGE_RATE * 100).toFixed(1) + '%',
          salesTaxRate: (SALES_TAX_RATE * 100).toFixed(1) + '%',
        };
      };

      // Calculate pricing for all ticket types
      const ticketPricing = {
        regular: event.ticket_heading?.price
          ? calculatePricing(event.ticket_heading.price)
          : null,
        vip: event.ticket_heading?.vip_price
          ? calculatePricing(event.ticket_heading.vip_price)
          : null,
        vvip: event.ticket_heading?.vvip_price
          ? calculatePricing(event.ticket_heading.vvip_price)
          : null,
      };
      try {
        const userInfoResponse = await this.userInfoService.getUserInfo([
          event.user_id,
        ]);
        const enrichedEvent = {
          ...event,
          pricing: ticketPricing,
          organizerInfo: userInfoResponse[event.user_id] || null,
          ticketsCount: allTicketsCounter,
        };

        await queryRunner.commitTransaction();
        return enrichedEvent;
      } catch (userInfoError) {
        console.error('Failed to fetch organizer info:', userInfoError);
        const fallbackEvent = {
          ...event,
          pricing: ticketPricing,
          organizerInfo: null,
          ticketsCount: allTicketsCounter,
        };

        await queryRunner.commitTransaction();
        return fallbackEvent;
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async notifyLiveTicketPurchaseCounter(
    allTicketsCounter: any,
    eventId: string,
  ): Promise<void> {
    this.socket.handleLiveTicketPurchaseCounter({
      event_id: eventId,
      totalTickets: allTicketsCounter,
    });
  }

  async findByUser(user: string): Promise<Events[]> {
    const event = await this.createEventRepository.findByUser(user);
    if (!event) {
      throw new NotFoundException(`Event with User ${user} not found.`);
    }
    return event;
  }

  async findByUserAndStatus(user: string, status: string): Promise<Events[]> {
    const event = await this.createEventRepository.findByUserAndStatus(
      user,
      status,
    );
    if (!event) {
      throw new NotFoundException(
        `Event with user and status ${user} not found.`,
      );
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

  async findByStatus(status: string): Promise<Events[]> {
    const event = await this.createEventRepository.findByStatus(status);
    if (!event) {
      throw new NotFoundException(`Event with Status ${status} not found.`);
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
    const saturday = startOfDay(nextSaturday(date));
    const sunday = endOfDay(nextSunday(saturday));

    return { saturday, sunday };
  }

  async analyticsEvent(): Promise<any> {
    return this.createEventRepository.analyticsEvents();
  }

  async countMyEvent(user: string): Promise<any> {
    return this.createEventRepository.countMyEvents(user);
  }

  async singleEventAnalytics(event: string): Promise<any> {
    return this.createEventRepository.singleEventAnalytics(event);
  }

  async getUserEventStats(
    userId: string,
  ): Promise<{ organized: number; participated: number }> {
    const organized =
      await this.createEventRepository.countEventsOrganizedByUser(userId);
    const participated =
      await this.createEventRepository.countEventsUserParticipatedIn(userId);

    return { organized, participated };
  }

  async calculateEventRemainingTime(event: Events): Promise<string> {
    const event_id = event.id.toString();
    const targetDate = new Date(event.event_start_date);
    const endDate = new Date(event.event_end_date);
    const currentDate = new Date();

    if (currentDate >= endDate) {
      this.socket.handleEventRemainingTime({
        event_id,
        remainingTime: 'Event Ended',
      });
      return 'Event Ended';
    }

    if (currentDate >= targetDate) {
      this.socket.handleEventRemainingTime({
        event_id,
        remainingTime: 'Event Started',
      });
      return 'Event Started';
    }

    return new Promise((resolve) => {
      const countdownInterval = setInterval(() => {
        const remainingTimeMs = targetDate.getTime() - new Date().getTime();

        if (remainingTimeMs <= 0) {
          clearInterval(countdownInterval);
          this.socket.handleEventRemainingTime({
            event_id,
            remainingTime: 'Event Started',
          });
          resolve('Event Started');
        } else {
          const days = Math.floor(remainingTimeMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (remainingTimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          );
          const minutes = Math.floor(
            (remainingTimeMs % (1000 * 60 * 60)) / (1000 * 60),
          );
          const seconds = Math.floor((remainingTimeMs % (1000 * 60)) / 1000);

          const remainingTime = `${days}D: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

          this.socket.handleEventRemainingTime({ event_id, remainingTime });
        }
      }, 1000);
    });
  }

  async getTicketSalesOverview(
    eventId: string,
  ): Promise<TicketSalesOverviewResponseDto> {
    const overview =
      await this.createEventRepository.getTicketSalesOverview(eventId);
    if (!overview) {
      throw new NotFoundException(
        `Ticket sales overview for event ${eventId} not found`,
      );
    }
    return overview;
  }

  async approveEvent(
    eventId: string,
    feedback: string | undefined,
    adminId: string,
  ): Promise<Events> {
    const event = await this.createEventRepository.findOneEventOnly(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    if (event.status !== 'pending') {
      throw new BadRequestException(
        `Event with ID ${eventId} is not in pending status`,
      );
    }
    event.status = 'active';
    event.feedback = feedback || null;
    event.update_by = adminId;
    event.updated_at = new Date();
    return await this.createEventRepository.update(eventId, event, adminId);
  }

  async rejectEvent(
    eventId: string,
    feedback: string,
    adminId: string,
  ): Promise<Events> {
    const event = await this.createEventRepository.findOneEventOnly(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    if (event.status !== 'pending') {
      throw new BadRequestException(
        `Event with ID ${eventId} is not in pending status`,
      );
    }
    event.status = 'rejected';
    event.feedback = feedback;
    event.update_by = adminId;
    event.updated_at = new Date();
    return await this.createEventRepository.update(eventId, event, adminId);
  }

  async requestEventChanges(
    eventId: string,
    feedback: string,
    adminId: string,
  ): Promise<Events> {
    const event = await this.createEventRepository.findOneEventOnly(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    if (event.status !== 'pending') {
      throw new BadRequestException(
        `Event with ID ${eventId} is not in pending status`,
      );
    }
    event.status = 'drafted';
    event.feedback = feedback;
    event.update_by = adminId;
    event.updated_at = new Date();
    return await this.createEventRepository.update(eventId, event, adminId);
  }

  async setEventPending(
    eventId: string,
    feedback: string | undefined,
    userId: string,
  ): Promise<Events> {
    const event = await this.createEventRepository.findOneEventOnly(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    if (event.status !== 'drafted') {
      throw new BadRequestException(
        `Event with ID ${eventId} must be in drafted status to transition to pending`,
      );
    }
    event.status = 'pending';
    event.feedback = feedback || null;
    event.update_by = userId;
    event.updated_at = new Date();
    return await this.createEventRepository.update(eventId, event, userId);
  }

  async cancelEvent(
    eventId: string,
    feedback: string | undefined,
    userId: string,
  ): Promise<Events> {
    const event = await this.createEventRepository.findOneEventOnly(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    if (!['active', 'pending', 'drafted'].includes(event.status)) {
      throw new BadRequestException(
        `Event with ID ${eventId} cannot be cancelled from ${event.status} status`,
      );
    }
    event.status = 'cancelled';
    event.feedback = feedback || null;
    event.update_by = userId;
    event.updated_at = new Date();
    return await this.createEventRepository.update(eventId, event, userId);
  }
}
