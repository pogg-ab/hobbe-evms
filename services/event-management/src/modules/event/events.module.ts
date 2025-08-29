import { AutomapperModule } from '@automapper/nestjs';
import { Inject, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ClientKafka, ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateEventCommandHandler } from 'src/application/handlers/events/create-event.handler';
import { DeleteEventCommandHandler } from 'src/application/handlers/events/delete-event.handler';
import { GetAllEventsQueryHandler } from 'src/application/handlers/events/get-all-events.handler';
import { GetEventsByIdQueryHandler } from 'src/application/handlers/events/get-events-by-id.handler';
import { UpdateEventsCommandHandler } from 'src/application/handlers/events/update-event.handler';
import { EventsProfile } from 'src/application/mappers/event.profile';
import { EventsService } from 'src/application/services/events/events.service';
import { UserValidationService } from 'src/application/services/events/user-validation.service';
import { Events } from 'src/domain/entities/events.entity';
import { CREATE_EVENT_REPOSITORY_TOKEN } from 'src/domain/repositories/events/event.repository.token';
import { kafkaProducerConfig } from 'src/infrastructure/kafka/kafka.config';
import { EventRepositoryEmpl } from 'src/infrastructure/persistence/repositories/event.repository.impl';
import { EventsController } from 'src/presentation/controllers/events/events.controller';
import { JwtStrategy } from './jwt.strategy';
import { GetEventsByCategoryQueryHandler } from 'src/application/handlers/events/get-events-by-category.handler';
import { GetEventsByLocationQueryHandler } from 'src/application/handlers/events/get-evets-by-location.handler';
import { SearchEventQueryHandler } from 'src/application/handlers/events/search-events.handler';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { CategoriesModule } from '../categories/categories.module';
import { TicketsModule } from '../ticketes/tickets.module';
import { TicketsHeadingModule } from '../ticketes/tickets-heading.module';
import { PromocodeModule } from '../promocode/promocode.module';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer.servicce';
import { FindEventsByUserQueryHandler } from 'src/application/handlers/events/find-events-by-user.handler';
import { FindByOrganiserQueryHandler } from 'src/application/handlers/events/find-evens-byorganiser.handler';
import { FindEventsByThisWeekendQueryHandler } from 'src/application/handlers/events/find-events-by-this-weekend.handler';
import { FindEventsBySpecificDateQueryHandler } from 'src/application/handlers/events/find-events-by-specific-date.handler';
import { FindEventsByDateRangeQueryQueryHandler } from 'src/application/handlers/events/find-events-by-daterange.handler';
import { AnalyticsController } from 'src/presentation/controllers/analytics/analytics.controller';
import { CountMyEventCommandHandler } from 'src/application/handlers/analytics/count-my-events.handler';
import { SingleEventAnalyticsCommandHandler } from 'src/application/handlers/analytics/single-event-analytics.handler';
import { SocketIo } from 'src/infrastructure/socket-io/socket.gateway';
import { GetEventRemainingTimeQueryHandler } from 'src/application/handlers/events/get-event-remaining-time.query-handler';
import { CREATE_TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/tickets.repository.token';
import { TicketsRepositoryEmpl } from 'src/infrastructure/persistence/repositories/tickets.repository.impl';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { GetEventsByStatusQueryHandler } from 'src/application/handlers/events/get-events-by-status.handler';
import { kafkaUserInfoConfig } from 'src/infrastructure/kafka/kafka.user-info.config';
import { UserInfoService } from 'src/application/services/user-info/user-info.service';
import { GetAllEventsByAuthQueryHandler } from 'src/application/handlers/events/get-all-events-by-auth.handler';
import { AnalyticsEventCommandHandler } from 'src/application/handlers/analytics/analytics-events.handler';
import { StreamProducerService } from 'src/infrastructure/kafka/stream.producer.service';
import { FindEventsByUserAndStatusQueryHandler } from 'src/application/handlers/events/find-events-by-user-and-status.handler';
import { GetUserEventStatsQueryHandler } from 'src/application/handlers/analytics/get-user-event-stats.query-handler';
import { AuditLogModule } from 'src/modules/audit-log/audit-log.module';
import { AuditLogInterceptor } from 'src/presentation/interceptors/audit-log.interceptor';
import { ConfigModule } from '@nestjs/config';
import { kafkaPermissionConfig } from 'src/infrastructure/kafka/kafka-permission-config';
import { PermissionCheckingService } from 'src/application/services/permissions-checking/permission-checking.service';
import { GetFilteredEventsQueryHandler } from 'src/application/handlers/events/get-filtered-events-query.handler';
import { GetTicketSalesOverviewQueryHandler } from 'src/application/handlers/events/get-ticket-sales-overview.query.handler';
import {
  ApproveEventCommandHandler,
  SetEventPendingCommandHandler,
} from 'src/application/handlers/events/event-status.command.handlers';
import { set } from 'date-fns';

@Module({
  imports: [
    ConfigModule,
    TicketsHeadingModule,
    TicketsModule,
    PromocodeModule,
    CategoriesModule,
    AutomapperModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    ClientsModule.register([
      {
        name: 'KAFKA_VALIDATE_USER_SERVICE',
        transport: kafkaProducerConfig.transport,
        options: kafkaProducerConfig.options,
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_USER_SERVICE',
        useFactory: async () => ({
          transport: kafkaUserInfoConfig.transport,
          options: kafkaUserInfoConfig.options,
        }),
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'CHECK_PERMISSION_SERVICE',
        useFactory: async () => ({
          transport: kafkaPermissionConfig.transport,
          options: kafkaPermissionConfig.options,
        }),
      },
    ]),
    TypeOrmModule.forFeature([Events, Tickets, ParticipantHasTicket]),
    CqrsModule,
    AuditLogModule,
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER', // This name must match the @Inject() token
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'event-management-producer',
            brokers: [process.env.KAFKA_BROKER],
          },
        },
      },
    ]),
  ],
  controllers: [EventsController, AnalyticsController],
  providers: [
    EventsService,
    CreateTicketsDto,
    UserInfoService,
    StreamProducerService,
    CreateEventCommandHandler,
    KafkaProducerService,
    UpdateEventsCommandHandler,
    DeleteEventCommandHandler,
    GetAllEventsQueryHandler,
    GetEventsByIdQueryHandler,
    GetEventRemainingTimeQueryHandler,
    FindEventsByUserQueryHandler,
    GetAllEventsByAuthQueryHandler,
    GetEventsByCategoryQueryHandler,
    GetEventsByLocationQueryHandler,
    GetEventsByStatusQueryHandler,
    FindByOrganiserQueryHandler,
    FindEventsByUserAndStatusQueryHandler,
    FindEventsByThisWeekendQueryHandler,
    FindEventsBySpecificDateQueryHandler,
    FindEventsByDateRangeQueryQueryHandler,
    CountMyEventCommandHandler,
    SingleEventAnalyticsCommandHandler,
    AnalyticsEventCommandHandler,
    SearchEventQueryHandler,
    GetUserEventStatsQueryHandler,
    GetFilteredEventsQueryHandler,
    GetTicketSalesOverviewQueryHandler,
    ApproveEventCommandHandler,
    SetEventPendingCommandHandler,
    EventsProfile,
    UserValidationService,
    PermissionCheckingService,
    JwtStrategy,
    SocketIo,
    AuditLogInterceptor,
    {
      provide: CREATE_EVENT_REPOSITORY_TOKEN,
      useClass: EventRepositoryEmpl,
    },
    {
      provide: CREATE_TICKET_REPOSITORY_TOKEN,
      useClass: TicketsRepositoryEmpl,
    },
  ],
})
export class EventsModule {
  constructor(
    @Inject('KAFKA_VALIDATE_USER_SERVICE') private client: ClientKafka,
  ) {}

  async onModuleInit() {
    this.client.subscribeToResponseOf('validateUser');
    await this.client.connect();
  }
}
