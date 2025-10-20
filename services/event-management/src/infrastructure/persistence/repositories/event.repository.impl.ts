import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { start } from 'repl';
import { Events } from 'src/domain/entities/events.entity';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { IEventRepository } from 'src/domain/repositories/events/event-repository';
import { FilterEventsDto } from 'src/presentation/dtos/events/filter-events.dto';
import {
  TicketSalesOverviewResponseDto,
  TicketTypeOverview,
} from 'src/presentation/dtos/events/ticket-sales-overview-response.dto';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { Between, EntityManager, Repository } from 'typeorm';

@Injectable()
export class EventRepositoryEmpl implements IEventRepository {
  constructor(
    @InjectRepository(Events)
    private eventRepository: Repository<Events>,
    public readonly createTicketsDto: CreateTicketsDto,
    @InjectRepository(ParticipantHasTicket)
    private participantHasTicketRepository: Repository<ParticipantHasTicket>,
  ) {}

  async create(
    event: Events,
    user: any,
    entityManager?: EntityManager,
  ): Promise<Events> {
    try {
      const newEvent = this.eventRepository.create(event);
      newEvent.user_id = user;
      newEvent.created_by = user;
      newEvent.created_at = new Date();
      let storedEvent: Events;
      if (entityManager) {
        storedEvent = await entityManager.save(Events, newEvent);
      } else {
        storedEvent = await this.eventRepository.save(newEvent);
      }

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
    const offset = (page - 1) * limit;
    const currentDate = new Date().toISOString(); // outputs in UTC

    const [events, total] = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.event_end_date >= :currentDate', { currentDate })
      .loadRelationCountAndMap('event.likes', 'event.likes')
      .loadRelationCountAndMap('event.favorites', 'event.favorites')
      .loadRelationCountAndMap('event.share', 'event.shares')
      .loadRelationCountAndMap('event.comments', 'event.comments')
      .loadRelationCountAndMap('event.bookings', 'event.bookings')
      .orderBy('event.event_start_date', 'DESC')
      .skip(offset)
      .take(limit)
      .cache(30000)
      .getManyAndCount();
    if (events.length === 0) {
      return { events: [], total, page, limit };
    }

    return { events, total, page, limit };
  }

  async findAllByAuth(
    user: string,
    page: number,
    limit: number,
  ): Promise<{
    events: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const offset = (page - 1) * limit;
    const currentDate = new Date().toISOString(); // outputs in UTC

    // Fetch the user's liked events
    const likedEventIds = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoin('event.likes', 'like')
      .where('like.user_id = :userId', { userId: user })
      .select('event.id')
      .getRawMany();

    const likedEventIdsSet = new Set(likedEventIds.map((e) => e.event_id));

    // Now fetch all events and add the likedByUser flag based on likedEventIdsSet
    const [events, total] = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.event_end_date >= :currentDate', { currentDate })
      .leftJoinAndSelect('event.likes', 'like', 'like.user_id = :userId', {
        userId: user,
      })
      .loadRelationCountAndMap('event.likes', 'event.likes')
      .loadRelationCountAndMap('event.favorites', 'event.favorites')
      .loadRelationCountAndMap('event.shares', 'event.shares')
      .loadRelationCountAndMap('event.comments', 'event.comments')
      .loadRelationCountAndMap('event.bookings', 'event.bookings')
      .addSelect([
        // This ensures we know if the user liked the event without needing a separate set
        '(CASE WHEN like.user_id IS NOT NULL THEN true ELSE false END) AS isLiked',
      ])
      .orderBy('event.event_start_date', 'DESC')
      .skip(offset)
      .take(limit)
      .cache(30000)
      .getManyAndCount();

    // Add the likedByUser flag
    const eventsWithLikeStatus = events.map((event) => ({
      ...event,
      isLiked: likedEventIdsSet.has(event.id), // Check if the event is in the user's liked set
    }));

    return { events: eventsWithLikeStatus, total, page, limit };
  }

  async findOneEventOnly(id: string): Promise<Events | null> {
    const event = await this.eventRepository.findOne({
      where: { id: id },
      // relations: ['promocodes','bank_accounts','ticket_heading.tickets','tickets'],
      // relations: ['promocodes','bank_accounts','ticket_heading.tickets','likes'],
    });

    if (!event) {
      throw new HttpException(
        `Event with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const bookedTicketCount = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoin('event.ticket_heading', 'ticket_heading')
      .leftJoin('ticket_heading.tickets', 'ticket')
      .select('COUNT(ticket.id)', 'count')
      .where('event.id = :id', { id })
      .andWhere('ticket.status = :status', { status: 'Booked' })
      .getRawOne();

    const my_event = {
      ...event,
      soldOutTickets: parseInt(bookedTicketCount.count, 10),
    };

    return my_event;
  }
  async findOne(id: string): Promise<Events | null> {
    const event = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.promocodes', 'promocode')
      .leftJoinAndSelect('event.ticket_heading', 'ticket_heading')
      .leftJoinAndSelect('event.bookings', 'bookings')
      .leftJoin('ticket_heading.tickets', 'ticket')
      .loadRelationCountAndMap('event.likes', 'event.likes')
      .loadRelationCountAndMap('event.share', 'event.shares')
      .loadRelationCountAndMap('event.comments', 'event.comments')
      .loadRelationCountAndMap('event.total_ticket', 'ticket_heading.tickets')
      .loadRelationCountAndMap('event.bookings', 'event.bookings')
      .addSelect((subQuery) => {
        return subQuery
          .select(`json_agg(bank_accounts)`)
          .from('bank_accounts', 'bank_accounts')
          .where('bank_accounts.event_id = event.id::varchar');
      }, 'bank_accounts')
      .where('event.id = :id', { id })
      .getRawAndEntities();

    if (!event.entities.length) {
      throw new HttpException(
        `Event with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const bookedTicketCount = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoin('event.ticket_heading', 'ticket_heading')
      .leftJoin('ticket_heading.tickets', 'ticket')
      .select('COUNT(ticket.id)', 'count')
      .where('event.id = :id', { id })
      .andWhere('ticket.status = :status', { status: 'Booked' })
      .getRawOne();

    const my_event = {
      ...event.entities[0],
      bank_accounts: event.raw[0].bank_accounts ?? [],
      soldOutTickets: parseInt(bookedTicketCount.count, 10),
    };

    return my_event;
  }

  async findByUser(user: string): Promise<Events[]> {
    const events = await this.eventRepository.find({
      where: { user_id: user },
      order: {
        event_start_date: 'DESC', // or 'DESC' for descending order
      },
    });

    // Check if no events were found
    if (events.length === 0) {
      throw new HttpException(
        `Events with user ${user} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return events;
  }

  async findByUserAndStatus(user: string, status: string): Promise<Events[]> {
    const now = new Date();

    let events: Events[] = [];

    if (status === 'drafted') {
      events = await this.eventRepository.find({
        where: { user_id: user, status },
        order: { event_start_date: 'DESC' },
      });
    } else {
      const operator = status === 'future' ? '>' : '<';

      events = await this.eventRepository
        .createQueryBuilder('event')
        .where('event.user_id = :user', { user })
        .andWhere(`event.event_start_date ${operator} :now`, { now })
        .orderBy('event.event_start_date', 'DESC')
        .getMany();
    }

    // Check if no events were found
    if (events.length === 0) {
      throw new HttpException(
        `Events with user ${user} and status ${status} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return events;
  }

  async findByCategory(category: string): Promise<Events[]> {
    const events = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.categories @> :category', {
        category: [category], // Pass category as an array
        order: {
          event_start_date: 'DESC', // or 'DESC' for descending order
        },
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
  }
  async findByStatus(status: string): Promise<Events[]> {
    const events = await this.eventRepository.find({
      where: { status: status },
      order: {
        event_start_date: 'DESC', // or 'DESC' for descending order
      },
    });

    // Check if no events were found
    if (events.length === 0) {
      throw new HttpException(
        `Events with status ${status} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return events;
  }

  async findByLocation(location: string): Promise<Events[]> {
    const events = await this.eventRepository.find({
      where: { location: location },
      order: {
        event_start_date: 'DESC', // or 'DESC' for descending order
      },
    });

    // Check if no events were found
    if (events.length === 0) {
      throw new HttpException(
        `Events with status ${location} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return events;
  }

  async findByOrganiser(organiser: string): Promise<Events[]> {
    const events = await this.eventRepository.find({
      where: { user_id: organiser },
      order: {
        event_start_date: 'DESC', // or 'DESC' for descending order
      },
    });

    // Check if no events were found
    if (events.length === 0) {
      throw new HttpException(
        `Events with organiser ${organiser} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return events;
  }

  async findByDateRange(
    startOfDay: Date,
    endOfDay: Date,
  ): Promise<Events[] | []> {
    const events = await this.eventRepository.find({
      where: { event_start_date: Between(startOfDay, endOfDay) },
      order: {
        event_start_date: 'DESC', // or 'DESC' for descending order
      },
    });

    // Check if no events were found
    if (events.length === 0) {
      throw new HttpException(
        `Events with this given date range not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return events;
  }

  async findFiltered(filterEventsDto: FilterEventsDto): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      countType = 'all',
      status = 'all',
      eventStatus = 'all',
      eventType = 'all',
      organizer,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
      sortBy = 'startDate',
      sortOrder = 'asc',
    } = filterEventsDto;

    const offset = (page - 1) * limit;
    const queryBuilder = this.eventRepository.createQueryBuilder('event');

    // Apply filters based on countType
    if (countType !== 'all') {
      if (countType === 'Total events') {
      } else if (countType === 'Active events') {
        queryBuilder.where('event.status = :status', { status: 'active' });
      } else if (countType === 'Pending events') {
        queryBuilder.where('event.status = :status', { status: 'pending' });
      }
    }

    // Apply status filter (Upcoming, Ongoing, Past, Pending Approval)
    if (status !== 'all') {
      const currentDate = new Date();
      if (status === 'Upcoming') {
        queryBuilder.andWhere('event.event_start_date > :currentDate', {
          currentDate,
        });
      } else if (status === 'Ongoing') {
        queryBuilder.andWhere(
          'event.event_start_date <= :currentDate AND event.event_end_date >= :currentDate',
          {
            currentDate,
          },
        );
      } else if (status === 'Past') {
        queryBuilder.andWhere('event.event_end_date < :currentDate', {
          currentDate,
        });
      } else if (status === 'Pending Approval') {
        queryBuilder.andWhere('event.status = :status', { status: 'pending' });
      }
    }

    // Apply eventStatus filter (drafted, pending, cancelled, rejected, postponed, active)
    if (eventStatus !== 'all') {
      queryBuilder.andWhere('event.status = :eventStatus', {
        eventStatus: eventStatus.toLowerCase(),
      });
    }

    // Apply eventType filter
    if (eventType !== 'all') {
      queryBuilder.andWhere('event.event_type = :eventType', { eventType });
    }

    // Apply organizer filter (using user_id)
    if (organizer) {
      queryBuilder.andWhere('event.user_id = :organizer', { organizer });
    }

    // Apply date range filter
    if (startDate && endDate) {
      queryBuilder.andWhere(
        'event.event_start_date BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    } else if (startDate) {
      queryBuilder.andWhere('event.event_start_date >= :startDate', {
        startDate,
      });
    } else if (endDate) {
      queryBuilder.andWhere('event.event_end_date <= :endDate', { endDate });
    }

    // Apply search filter (title or description)
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(event.title) LIKE LOWER(:search) OR LOWER(event.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Apply category filter (using categories array)
    if (
      eventType !== 'all' &&
      [
        'Conference',
        'Workshop',
        'Seminar',
        'Webinar',
        'Networking',
        'Other',
      ].includes(eventType)
    ) {
      queryBuilder.andWhere('event.categories @> :category', {
        category: [eventType],
      });
    }

    // Apply sorting
    const sortFieldMap: { [key: string]: string } = {
      startDate: 'event.event_start_date',
      createdAt: 'event.created_at',
      title: 'event.title',
      eventType: 'event.event_type',
      organizer: 'event.user_id',
    };
    const sortField = sortFieldMap[sortBy] || 'event.event_start_date';
    queryBuilder.orderBy(sortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Load relation counts
    queryBuilder
      .loadRelationCountAndMap('event.likes', 'event.likes')
      .loadRelationCountAndMap('event.favorites', 'event.favorites')
      .loadRelationCountAndMap('event.shares', 'event.shares')
      .loadRelationCountAndMap('event.comments', 'event.comments')
      .loadRelationCountAndMap('event.bookings', 'event.bookings');

    // Apply pagination
    queryBuilder.skip(offset).take(limit).cache(30000);

    // Execute query
    const [events, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    if (events.length === 0) {
      return { events: [], total, page, limit, totalPages: 0 };
    }

    return { events, total, page, limit, totalPages };
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
      .orderBy('event.event_start_date', 'DESC')
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
  }

  async update(id: string, event: Events, user: any): Promise<Events> {
    try {
      const eventToBeUpdate = await this.findOneEventOnly(id);
      const updatedAccount = Object.assign(eventToBeUpdate, event);
      updatedAccount.update_by = user;
      updatedAccount.updated_at = new Date();
      return await this.eventRepository.save(updatedAccount);
    } catch (error) {
      throw new HttpException(
        `Error Updating Event: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<void> {
    const eventToDelete = await this.findOne(id);
    await this.eventRepository.delete(id);
  }

  async findUpcomingEvents(startTime: Date, endTime: Date): Promise<Events[]> {
    try {
      return this.eventRepository.find({
        where: {
          status: 'active', // Only remind for active events
          event_start_date: Between(startTime, endTime),
        },
      });
    } catch (error) {
      // It's good practice to wrap repository calls in a try/catch
      throw new InternalServerErrorException(
        `Error fetching upcoming events: ${error.message}`,
      );
    }
  }

  // Analitics
  // async countMyEvents(user:string):Promise<any>{
  //   const eventCount = await this.eventRepository.count({
  //     where: { 'user_id': user },
  //   });

  //   // Use a QueryBuilder to count tickets grouped by status
  //   const ticketStatusCount = await this.eventRepository
  //     .createQueryBuilder('event')
  //     .leftJoinAndSelect('event.tickets', 'ticket')
  //     .select('ticket.status', 'status')
  //     .addSelect('COUNT(ticket.id)', 'count')
  //     .where('event.user_id = :userId', { userId: user })
  //     .groupBy('ticket.status')
  //     .getRawMany();

  //   // Prepare the result in the desired format
  //   const ticketStatusObject = ticketStatusCount.reduce((acc, item) => {
  //     acc[item.status] = parseInt(item.count, 10);
  //     return acc;
  //   }, {});

  //   return {
  //     TotalCreatedEvents: eventCount,
  //     AllEventsTicketsCounter: ticketStatusObject,
  //   };

  // }
  async analyticsEvents(): Promise<any> {
    // Count total events
    const eventCount = await this.eventRepository.count();

    // Count tickets grouped by status
    const ticketStatusCount = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.tickets', 'ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(ticket.id)', 'count')
      .groupBy('ticket.status')
      .getRawMany();

    const qrcodeStats = await await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.tickets', 'ticket')
      .leftJoin('ticket.qrcode_scanned', 'scanlog')
      .select('COUNT(DISTINCT ticket.id)', 'total-qrcode-generated')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN scanlog.id IS NOT NULL THEN ticket.id END)',
        'scanned-qrcode-count',
      )
      .getRawOne();

    const grossRevenue = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoin('event.tickets', 'ticket')
      .select('SUM(ticket.price)', 'grossRevenue')
      .where('ticket.status = :status', { status: 'paid' })
      .getRawOne();

    // Count total comments for the user
    const commentCount = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.comments', 'comment')
      .select('COUNT(comment.id)', 'count')
      .getRawOne();

    // Count total likes for the user
    const likeCount = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.likes', 'like')
      .select('COUNT(like.id)', 'count')
      .getRawOne();

    // Helper function to process ticket status counts
    const processTicketStatusData = (data: any[]): Record<string, number> =>
      data.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count, 10);
        return acc;
      }, {});

    return {
      TotalCreatedEvents: eventCount,
      AllEventsTicketsCount: processTicketStatusData(ticketStatusCount),
      GrossRevenue: grossRevenue.grossRevenue,
      TotalCommentsCount: parseInt(commentCount.count, 10),
      TotalLikesCount: parseInt(likeCount.count, 10),
      qrcodeStats,
    };
  }

  async countMyEvents(user: string): Promise<any> {
    // Count total events
    const eventCount = await this.eventRepository.count({
      where: { user_id: user },
    });

    // Count tickets grouped by status
    const ticketStatusCount = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.tickets', 'ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(ticket.id)', 'count')
      .where('event.user_id = :userId', { userId: user })
      .groupBy('ticket.status')
      .getRawMany();

    const qrcodeStats = await await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.tickets', 'ticket')
      .leftJoin('ticket.qrcode_scanned', 'scanlog')
      .select('COUNT(DISTINCT ticket.id)', 'total-qrcode-generated')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN scanlog.id IS NOT NULL THEN ticket.id END)',
        'scanned-qrcode-count',
      )
      .where('event.user_id = :userId', { userId: user })
      .getRawOne();

    const userGrossRevenue = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoin('event.tickets', 'ticket')
      .where('event.user_id = :userId', { userId: user })
      .andWhere('ticket.status = :status', { status: 'paid' })
      .select('SUM(ticket.price)', 'userGrossRevenue')
      .getRawOne();

    // Count total comments for the user
    const commentCount = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.comments', 'comment')
      .select('COUNT(comment.id)', 'count')
      .where('event.user_id = :userId', { userId: user })
      .getRawOne();

    // Count total likes for the user
    const likeCount = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.likes', 'like')
      .select('COUNT(like.id)', 'count')
      .where('event.user_id = :userId', { userId: user })
      .getRawOne();

    // Helper function to process ticket status counts
    const processTicketStatusData = (data: any[]): Record<string, number> =>
      data.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count, 10);
        return acc;
      }, {});

    return {
      TotalCreatedEvents: eventCount,
      AllEventsTicketsCount: processTicketStatusData(ticketStatusCount),
      UsergrossRevenue: userGrossRevenue.userGrossRevenue,
      TotalCommentsCount: parseInt(commentCount.count, 10),
      TotalLikesCount: parseInt(likeCount.count, 10),
      qrcodeStats,
    };
  }

  async singleEventAnalytics(event: string): Promise<any> {
    const events = await this.eventRepository.find({
      where: { id: event },
    });

    // Count tickets grouped by status
    const ticketStatusCount = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.tickets', 'ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(ticket.id)', 'count')
      .where('event.id = :id', { id: event })
      .groupBy('ticket.status')
      .getRawMany();

    const qrcodeStats = await await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.tickets', 'ticket')
      .leftJoin('ticket.qrcode_scanned', 'scanlog')
      .select('COUNT(DISTINCT ticket.id)', 'total-qrcode-generated')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN scanlog.id IS NOT NULL THEN ticket.id END)',
        'scanned-qrcode-count',
      )
      .where('event.id = :id', { id: event })
      .getRawOne();

    const eventGrossRevenue = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoin('event.tickets', 'ticket')
      .where('event.id = :id', { id: event })
      .andWhere('ticket.status = :status', { status: 'paid' }) // make sure casing matches your DB values
      .select('SUM(ticket.price)', 'eventGrossRevenue')
      .getRawOne();

    // Count total comments for the user
    const commentCount = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.comments', 'comment')
      .select('COUNT(comment.id)', 'count')
      .where('event.id = :id', { id: event })
      .getRawOne();

    // Count total likes for the user
    const likeCount = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.likes', 'like')
      .select('COUNT(like.id)', 'count')
      .where('event.id = :id', { id: event })
      .getRawOne();

    // Helper function to process ticket status counts
    const processTicketStatusData = (data: any[]): Record<string, number> =>
      data.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count, 10);
        return acc;
      }, {});

    return {
      events,
      TicketsCount: processTicketStatusData(ticketStatusCount),
      EventGrossRevenue: eventGrossRevenue.eventGrossRevenue,
      TotalCommentsCount: parseInt(commentCount.count, 10),
      TotalLikesCount: parseInt(likeCount.count, 10),
      qrcodeStats,
    };
  }

  async countEventsOrganizedByUser(userId: string): Promise<number> {
    const result = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.user_id = :userId', { userId })
      .getCount();

    return result;
  }

  async countEventsUserParticipatedIn(userId: string): Promise<number> {
    const result = await this.participantHasTicketRepository
      .createQueryBuilder('pht')
      .innerJoin('pht.booking_id', 'booking')
      .select('COUNT(DISTINCT booking.event_id)', 'count')
      .where('pht.participant_id = :userId', { userId })
      .getRawOne();

    return parseInt(result.count, 10);
  }

  async getTicketSalesOverview(
    eventId: string,
  ): Promise<TicketSalesOverviewResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['ticket_heading'],
    });

    if (!event) {
      throw new HttpException(
        `Event with ID ${eventId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const ticketCounts = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoin('event.ticket_heading', 'ticket_heading')
      .leftJoin('ticket_heading.tickets', 'ticket')
      .select('ticket.type', 'type')
      .addSelect('COUNT(ticket.id)', 'total')
      .addSelect(
        `COUNT(CASE WHEN ticket.status IN ('Paid', 'Booked', 'Completed') THEN ticket.id END)`,
        'sold',
      )
      .where('event.id = :eventId', { eventId })
      .groupBy('ticket.type')
      .getRawMany();

    const totalTickets = ticketCounts.reduce(
      (sum, count) => sum + parseInt(count.total, 10),
      0,
    );
    const soldTickets = ticketCounts.reduce(
      (sum, count) => sum + parseInt(count.sold, 10),
      0,
    );
    const availableTickets = totalTickets - soldTickets;

    const byType: TicketTypeOverview[] = ticketCounts.map((count) => ({
      type: count.type,
      total: parseInt(count.total, 10),
      sold: parseInt(count.sold, 10),
      available: parseInt(count.total, 10) - parseInt(count.sold, 10),
    }));

    return {
      eventId,
      totalTickets,
      soldTickets,
      availableTickets,
      byType,
    };
  }

  async findParticipatedByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.participantHasTicketRepository
      .createQueryBuilder('pht')
      .innerJoin('pht.booking_id', 'booking')
      .innerJoinAndMapOne(
        'booking.event',
        Events,
        'event',
        'event.id = booking.event_id',
      )
      .where('pht.participant_id = :userId', { userId })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('event.event_start_date', 'DESC');

    const [phtResults, total] = await queryBuilder.getManyAndCount();

    const events = phtResults
      .map((pht) => (pht.booking_id as any).event as Events)
      .filter(Boolean);

    return {
      events: events.length > 0 ? events : null,
      total,
      page,
      limit,
    };
  }
}
