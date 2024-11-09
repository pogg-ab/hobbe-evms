import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateEventCommandHandler } from 'src/application/handlers/create-event.handler';
import { GetAllEventsQueryHandler } from 'src/application/handlers/get-all-events.handler';
import { EventsProfile } from 'src/application/mappers/event.profile';
import { EventsService } from 'src/application/services/events/events.service';
import { Events } from 'src/domain/entities/events.entity';
import { CREATE_EVENT_REPOSITORY_TOKEN } from 'src/domain/repositories/create-event.repository.token';
import { EventRepositoryEmpl } from 'src/infrastructure/persistence/repositories/event.repository.impl';
import { EventsController } from 'src/presentation/controllers/events/events.controller';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([Events]),
    CqrsModule,
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    CreateEventCommandHandler,
    GetAllEventsQueryHandler,
    EventsProfile,
    {
      provide: CREATE_EVENT_REPOSITORY_TOKEN,
      useClass: EventRepositoryEmpl,
    }
  ],
})
export class EventsModule {}
