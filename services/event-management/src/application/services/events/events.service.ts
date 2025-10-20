import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  addHours,
  endOfDay,
  nextSaturday,
  nextSunday,
  startOfDay,
} from 'date-fns';
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
import { Connection, DataSource } from 'typeorm';
import { UserInfoService } from '../user-info/user-info.service';
import { StreamProducerService } from 'src/infrastructure/kafka/stream.producer.service';
import { CreateStreamDto } from 'src/presentation/dtos/live-stream/create-stream.dto';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { FilterEventsDto } from 'src/presentation/dtos/events/filter-events.dto';
import { TicketSalesOverviewResponseDto } from 'src/presentation/dtos/events/ticket-sales-overview-response.dto';
import { AdminUpdateEventsDto } from 'src/presentation/dtos/events/admin-update-events.dto';
import { ITicketBookingRepository } from 'src/domain/repositories/tickets/ticket-booking.repository';
import { CREATE_TICKET_BOOKING_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/ticket-booking.repository.token';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
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
    private readonly connection: Connection,
    @Inject(CREATE_TICKET_BOOKING_REPOSITORY_TOKEN)
    private readonly ticketBookingRepository: ITicketBookingRepository,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleEventReminders() {
    this.logger.log('Running scheduled job: Sending Event Reminders...');
    const now = new Date();
    const reminderWindowEnd = addHours(now, 24);

    try {
      const upcomingEvents =
        await this.createEventRepository.findUpcomingEvents(
          now,
          reminderWindowEnd,
        );

      if (upcomingEvents.length === 0) {
        this.logger.log('No upcoming events found within the 24-hour window.');
        return;
      }

      this.logger.log(
        `Found ${upcomingEvents.length} upcoming event(s) to process for reminders.`,
      );

      for (const event of upcomingEvents) {
        const subscriberIds =
          await this.ticketBookingRepository.findUserIdsByEventId(
            event.id.toString(),
          );

        if (subscriberIds.length > 0) {
          const eventPayload = {
            userIds: subscriberIds,
            eventId: event.id.toString(),
            eventName: event.title,
            updateMessage: `Reminder: Your event, "${event.title}", is starting in less than 24 hours!`,
          };

          await this.kafkaProducerService.produce({
            topic: 'event_reminder',
            messages: [{ value: JSON.stringify(eventPayload) }],
          });

          this.logger.log(
            `Emitted 'event_reminder' for event ${event.id} to ${subscriberIds.length} subscribers.`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error during handleEventReminders job:', error.stack);
    }
  }

  private createStream(user: string, event_id: IdValueObject): any {
    const stream = {
      userId: user,
      eventId: event_id,
    };
    return stream;
  }

  async create(createEventsDto: CreateEventsDto, user: any): Promise<Events> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const mappedEvent = this.mapper.map(
        createEventsDto,
        CreateEventsDto,
        Events,
      );
      const event = await this.createEventRepository.create(
        mappedEvent,
        user,
        queryRunner.manager,
      );
      const accounts = createEventsDto.bank_accounts;
      if (accounts) {
        const accountsWithIds = accounts.map((account) => ({
          ...account,
          event_id: event.id,
          user_id: event.user_id,
        }));
        const kafkaTimeout = 5000;
        const kafkaPromise = this.kafkaProducerService.produce({
          topic: 'bank-account-list-sent',
          messages: [{ value: JSON.stringify(accountsWithIds) }],
        });

        try {
          await Promise.race([
            kafkaPromise,
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error('Kafka producer timeout')),
                kafkaTimeout,
              ),
            ),
          ]);
        } catch (kafkaError) {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
          throw new ServiceUnavailableException(
            'Kafka service unavailable. Event creation aborted.',
          );
        }
      }
      if (event.ticket_heading) {
        const ticketPromises = [];
        for (let i = 0; i < event.ticket_heading.quantity; i++) {
          const ticketDto = await new CustomEventTicketMapper().map(
            event,
            this.createTicketsDto,
            'Regular',
          );
          const command = new CreateTicketsCommand(
            ticketDto,
            queryRunner.manager,
          );
          ticketPromises.push(this.commandBus.execute(command));
        }

        for (let i = 0; i < event.ticket_heading.vip_quantity; i++) {
          const ticketDto = await new CustomEventTicketMapper().map(
            event,
            this.createTicketsDto,
            'VIP',
          );
          const command = new CreateTicketsCommand(
            ticketDto,
            queryRunner.manager,
          );
          ticketPromises.push(this.commandBus.execute(command));
        }

        for (let i = 0; i < event.ticket_heading.vvip_quantity; i++) {
          const ticketDto = await new CustomEventTicketMapper().map(
            event,
            this.createTicketsDto,
            'VVIP',
          );
          const command = new CreateTicketsCommand(
            ticketDto,
            queryRunner.manager,
          );
          ticketPromises.push(this.commandBus.execute(command));
        }

        await Promise.all(ticketPromises);
      }

      if (event.location == 'Live') {
        const stream = this.createStream(user, event.id);

        await this.streamProducerService.sendStreamToKafka(stream);
      }

      await queryRunner.commitTransaction();

      return event;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      if (error.code === '23505') {
        throw new ConflictException(
          'Event with similar details already exists',
        );
      } else if (error.code === '23503') {
        throw new BadRequestException('Invalid reference data provided');
      } else if (error.name === 'QueryFailedError') {
        throw new InternalServerErrorException('Database operation failed');
      } else if (
        error.message.includes('Kafka') ||
        error.message.includes('stream') ||
        error.message.includes('producer') ||
        error.message.includes('timeout')
      ) {
        throw new ServiceUnavailableException(
          'External service temporarily unavailable',
        );
      } else if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create event. Please try again later.',
      );
    } finally {
      await queryRunner.release();
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
    const eventToUpdate = await this.findOne(id);
    if (!eventToUpdate) {
      throw new NotFoundException(`Event with id ${id} not found.`);
    }

    const mappedChanges = this.mapper.map(
      updateEventsDto,
      UpdateEventsDto,
      Events,
    );

    const updatedEvent = await this.createEventRepository.update(
      id,
      mappedChanges,
      user,
    );

    try {
      const userToNotify = eventToUpdate.user_id;

      const eventPayload = {
        userIds: [userToNotify],
        eventId: id,
        eventName: updatedEvent.title,
        updateMessage: `Your event details have been updated.`,
      };

      await this.kafkaProducerService.produce({
        topic: 'event_updated',
        messages: [{ value: JSON.stringify(eventPayload) }],
      });

      // Using logger instead of console.log
      this.logger.log(
        `Successfully emitted 'event_updated' event for event ${id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to emit 'event_updated' Kafka event for event ${id}`,
        error.stack,
      );
    }

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

  async adminUpdateEvent(
    eventId: string,
    adminUpdateEventsDto: AdminUpdateEventsDto,
    admin_id: string,
  ): Promise<Events> {
    const event = await this.createEventRepository.findOneEventOnly(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    if (!['drafted', 'pending', 'active'].includes(event.status)) {
      throw new BadRequestException(
        `Event with ID ${eventId} cannot be updated from ${event.status} status`,
      );
    }
    const updatedEvent = this.mapper.map(
      adminUpdateEventsDto,
      AdminUpdateEventsDto,
      Events,
      {
        extraArgs: () => ({ id: eventId, user_id: event.user_id }),
      },
    );
    updatedEvent.update_by = admin_id;
    updatedEvent.updated_at = new Date();
    return await this.createEventRepository.update(
      eventId,
      updatedEvent,
      admin_id,
    );
  }

  async findParticipatedByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.createEventRepository.findParticipatedByUser(
      userId,
      page,
      limit,
    );

    if (!result.events || result.events.length === 0) {
      return result;
    }

    const organizerIds = result.events.map((event) => event.user_id);
    let userInfoResponse = {};

    try {
      userInfoResponse = await this.userInfoService.getUserInfo(organizerIds);
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
}
