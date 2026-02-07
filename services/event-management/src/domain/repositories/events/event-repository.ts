import { CreateEventsDto } from 'src/presentation/dtos/events/create-events.dto';
import { Events } from '../../entities/events.entity';
import { FilterEventsDto } from 'src/presentation/dtos/events/filter-events.dto';
import { TicketSalesOverviewResponseDto } from 'src/presentation/dtos/events/ticket-sales-overview-response.dto';
import { EntityManager } from 'typeorm';

export interface IEventRepository {
  create(
    createEventsDto: CreateEventsDto,
    user: any,
    entityManager?: EntityManager,
  ): Promise<Events>;
  findAll(
    page: number,
    limit: number,
  ): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
  }>;
  findFiltered(filterEventsDto: FilterEventsDto): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  findAllByAuth(
    user: string,
    page: number,
    limit: number,
  ): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
  }>;
  findOne(id: string): Promise<Events | null>;
  findOneEventOnly(id: string): Promise<Events | null>;
  findByUser(user: string): Promise<Events[]>;
  findByUserAndStatus(user: string, status: string): Promise<Events[]>;
  findByCategory(category: string): Promise<Events[]>;
  findByStatus(status: string): Promise<Events[]>;
  findByLocation(location: string): Promise<Events[]>;
  findByOrganiser(organiser: string): Promise<Events[]>;
  findByDateRange(startOfDay: Date, endOfDay: Date): Promise<Events[] | []>;
  update(id: string, event: Events, user: any): Promise<Events>;
  delete(id: string): Promise<void>;

  // searching for events
  search(
    keyword: string,
    page: number,
    limit: number,
  ): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
  }>;

  // Analytics
  analyticsEvents(): Promise<any>;
  countMyEvents(user: string): Promise<any>;
  singleEventAnalytics(event: string): Promise<any>;

  countEventsOrganizedByUser(userId: string): Promise<number>;
  countEventsUserParticipatedIn(userId: string): Promise<number>;
  findParticipatedByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
  }>;
  getTicketSalesOverview(
    eventId: string,
  ): Promise<TicketSalesOverviewResponseDto>;
  findUpcomingEvents(startTime: Date, endTime: Date): Promise<Events[]>;
}
