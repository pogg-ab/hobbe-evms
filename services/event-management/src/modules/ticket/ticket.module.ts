import { AutomapperModule } from '@automapper/nestjs';
import { Inject, Module } from '@nestjs/common';
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
import { GetEventsByCategoryQueryHandler } from 'src/application/handlers/events/get-events-by-category.handler';
import { GetEventsByLocationQueryHandler } from 'src/application/handlers/events/get-evets-by-location.handler';
import { SearchEventQueryHandler } from 'src/application/handlers/events/search-events.handler';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { TicketsList } from 'src/domain/entities/tickets_list.entity';
import { JwtStrategy } from '../event/jwt.strategy';
import { CreateTicketsListCommandHandler } from 'src/application/handlers/tickets/create-ticketslist.handler';
import { TicktesListProfile } from 'src/application/mappers/tickets-list.profile';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { GetAllTicketsListHandler } from 'src/application/handlers/tickets/get-all-events-ticketslist.handler';
import { TicketsListController } from 'src/presentation/controllers/ticets-list/ticets-list.controller';
import { TicketsController } from 'src/presentation/controllers/tickets/tickets.controller';
import { TicketsListService } from 'src/application/services/tickets/ticketslist.service';
import { TicketsListRepositoryEmpl } from 'src/infrastructure/persistence/repositories/ticketslist.repository.impl';
import { TicketsService } from 'src/application/services/tickets/tickets.service';
import { CreateTicketsCommandHandler } from 'src/application/handlers/tickets/create-tickets.handler';
import { TicktesProfile } from 'src/application/mappers/tickets.profile';
import { TicketsListFindByIdQueryHandler } from 'src/application/handlers/tickets/findone-ticketslist.handler';

@Module({
  imports: [
    AutomapperModule,
    PassportModule,
    IdValueObject,
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
    TypeOrmModule.forFeature([Tickets,TicketsList]),
    CqrsModule,
  ],
  controllers: [
    TicketsController,
    TicketsListController,
  ],
  providers: [
    TicketsService,
    TicketsListService,
    IdValueObject,
    CreateTicketsListCommandHandler,
    CreateTicketsCommandHandler,
    GetAllTicketsListHandler,
    TicketsListFindByIdQueryHandler,
    UserValidationService,
    TicktesListProfile,
    TicktesProfile,
    JwtStrategy,
    {
      provide: CREATE_EVENT_REPOSITORY_TOKEN,
      useClass: TicketsListRepositoryEmpl,
    },
  ],
})
export class TicketsModule {
  constructor(@Inject('KAFKA_PRODUCER') private client: ClientKafka) {}

  async onModuleInit() {
    this.client.subscribeToResponseOf('validateUser');
    await this.client.connect();
  }
}
