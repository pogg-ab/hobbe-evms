import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SpecialGuestCommandHandler } from 'src/application/handlers/special-guest/create-special-guest.handler';
import { DeleteSpecialGuestCommandHandler } from 'src/application/handlers/special-guest/delete-special-guest.handler';
import { GetAllSpecialGuestsQueryHandler } from 'src/application/handlers/special-guest/find-all-special-guests.handler';
import { SpecialGuestFindByIdQueryHandler } from 'src/application/handlers/special-guest/find-special-guest-by-id.handler';
import { UpdatedSpecialGuestCommandHandler } from 'src/application/handlers/special-guest/update-special-guest.handler';
import { SpecialGuestProfile } from 'src/application/mappers/special-guest.profile';
import { SpecialGuestService } from 'src/application/services/special-guest/special-guest.service';
import { SpecialGuestRepositoryImpl } from 'src/infrastructure/persistence/repositories/special-guest.repository.impl';
import { SpecialGuestController } from 'src/presentation/controllers/special-guest/special-guest.controller';

import { SpecialGuest } from 'src/domain/entities/special-guest.entity';
import { SPECIAL_GUEST_REPOSITORY_TOKEN } from 'src/domain/repositories/special-guest/special-guest.repository.token';
import { FindSpecialGuestsByEventIdQueryHandler } from 'src/application/handlers/special-guest/find-special-guests-by-event-id.handler';
import { CREATE_EVENT_REPOSITORY_TOKEN } from 'src/domain/repositories/events/event.repository.token';
import { EventRepositoryEmpl } from 'src/infrastructure/persistence/repositories/event.repository.impl';
import { Events } from 'src/domain/entities/events.entity';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([SpecialGuest, Events]),
    CqrsModule,
  ],
  controllers: [SpecialGuestController],
  providers: [
    SpecialGuestService,
    SpecialGuestProfile,
    SpecialGuestCommandHandler,
    GetAllSpecialGuestsQueryHandler,
    FindSpecialGuestsByEventIdQueryHandler,
    SpecialGuestFindByIdQueryHandler,
    UpdatedSpecialGuestCommandHandler,
    DeleteSpecialGuestCommandHandler,
    CreateTicketsDto,
    {
      provide: SPECIAL_GUEST_REPOSITORY_TOKEN,
      useClass: SpecialGuestRepositoryImpl,
    },
    {
      provide: CREATE_EVENT_REPOSITORY_TOKEN,
      useClass: EventRepositoryEmpl,
    },
  ],
  exports: [SPECIAL_GUEST_REPOSITORY_TOKEN],
})
export class SpecialGuestModule { }
