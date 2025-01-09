import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventSponsorCommandHandler } from 'src/application/handlers/event-sponsor/create-event-sponsor.handler';
import { DeleteEventSponsorCommandHandler } from 'src/application/handlers/event-sponsor/delete-event-sponsor.handler';
import { GetAllEventSponsorsQueryHandler } from 'src/application/handlers/event-sponsor/find-all-event-sponsors.handler';
import { EventSponsorFindByIdQueryHandler } from 'src/application/handlers/event-sponsor/find-event-sponsor-by-id.handler';
import { UpdatedEventSponsorCommandHandler } from 'src/application/handlers/event-sponsor/update-event-sponsor.handler';
import { EventSponsorProfile } from 'src/application/mappers/event-sponsor.profile';
import { EventSponsorService } from 'src/application/services/event-sponsor/event-sponsor.service';
import { EventSponsor } from 'src/domain/entities/event-sponsor.entity';
import { Events } from 'src/domain/entities/events.entity';
import { EVENT_SPONSOR_REPOSITORY_TOKEN } from 'src/domain/repositories/event-sponsor/event-sponsor.repository.token';
import { CREATE_EVENT_REPOSITORY_TOKEN } from 'src/domain/repositories/events/event.repository.token';
import { EventSponsorRepositoryImpl } from 'src/infrastructure/persistence/repositories/event-sponsor.repository.impl';
import { EventRepositoryEmpl } from 'src/infrastructure/persistence/repositories/event.repository.impl';
import { EventSponsorController } from 'src/presentation/controllers/event-sponsor/event-sponsor.controller';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([EventSponsor, Events]),
    CqrsModule,
  ],
  controllers: [EventSponsorController],
  providers: [
    EventSponsorService,
    EventSponsorProfile,
    CreateTicketsDto,
    EventSponsorCommandHandler,
    GetAllEventSponsorsQueryHandler,
    EventSponsorFindByIdQueryHandler,
    UpdatedEventSponsorCommandHandler,
    DeleteEventSponsorCommandHandler,
    {
      provide: EVENT_SPONSOR_REPOSITORY_TOKEN,
      useClass: EventSponsorRepositoryImpl,
    },
    {
      provide: CREATE_EVENT_REPOSITORY_TOKEN,
      useClass: EventRepositoryEmpl,
    },
  ],
  exports: [EVENT_SPONSOR_REPOSITORY_TOKEN],
})
export class EventSponsorModule {}
