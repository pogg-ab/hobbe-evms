import { AutomapperModule } from '@automapper/nestjs';
import { forwardRef, Inject, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ClientKafka, ClientsModule } from '@nestjs/microservices';
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
import { CreateTicketsListDto } from 'src/presentation/dtos/tickets/create-tickets-list.dto';
import { CategoriesModule } from './categories/categories.module';
import { TicketsListModule } from './ticketes/tickets-list.module';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { TicketsController } from 'src/presentation/controllers/tickets/tickets.controller';
import { GetAllTicketsQueryHandler } from 'src/application/handlers/tickets/get-all-tickets.handler';
import { FindOneTicketQueryHandler } from 'src/application/handlers/tickets/find-one-tickets.handler';
import { UpdatedTicketHeadingCommandHandler } from 'src/application/queries/tickets/update-ticket-heading.handler';
import { TicketsModule } from './ticketes/tickets.module';


@Module({
  imports: [
    TicketsModule,
    TicketsListModule,
    CategoriesModule,
    AutomapperModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER',
        transport: kafkaProducerConfig.transport,
        options: kafkaProducerConfig.options,
      },
    ]),
    TypeOrmModule.forFeature([Events]),
    CqrsModule,
  ],
  controllers: [
    EventsController,
  ],
  providers: [
    EventsService,
    CreateTicketsListDto,
    CreateEventCommandHandler,
    UpdateEventsCommandHandler,
    DeleteEventCommandHandler,
    GetAllEventsQueryHandler,
    GetEventsByIdQueryHandler,
    GetEventsByCategoryQueryHandler,
    GetEventsByLocationQueryHandler,
    SearchEventQueryHandler,
    EventsProfile,
    UserValidationService,
    JwtStrategy,
    {
      provide: CREATE_EVENT_REPOSITORY_TOKEN,
      useClass: EventRepositoryEmpl,
    },
  ],
})
export class EventsModule {
  constructor(@Inject('KAFKA_PRODUCER') private client: ClientKafka) {}

  async onModuleInit() {
    this.client.subscribeToResponseOf('validateUser');
    await this.client.connect();
  }
}
