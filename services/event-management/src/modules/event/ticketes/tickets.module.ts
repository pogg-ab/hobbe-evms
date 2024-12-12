import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { TicketsController } from 'src/presentation/controllers/tickets/tickets.controller';
import { TicketsService } from 'src/application/services/tickets/tickets.service';
import { TicktesProfile } from 'src/application/mappers/tickets.profile';
import { TICKETS_LIST_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/ticketslist.repository.token';
import { TicketsRepositoryEmpl } from 'src/infrastructure/persistence/repositories/tickets.repository.impl';
import { GetAllTicketsHandler } from 'src/application/handlers/tickets/get-all-events-tickets.handler';
import { TicketsFindByIdQueryHandler } from 'src/application/handlers/tickets/findone-tickets.handler';
import { GetAllTicketsQueryHandler } from 'src/application/handlers/tickets/get-all-tickets.handler';
import { CreateTicketsCommandHandler } from 'src/application/handlers/tickets/create-tickets.handler';
import { TicketsFindByHeadingQueryHandler } from 'src/application/handlers/tickets/find-all-tickets-by-heading.handler';

@Module({
  
    imports: [
      AutomapperModule,
      TypeOrmModule.forFeature([Tickets]),
      CqrsModule,
    ],
    controllers: [TicketsController],
    providers: [
      TicketsService,
      TicktesProfile,
      CreateTicketsCommandHandler,

      GetAllTicketsQueryHandler,
      GetAllTicketsHandler,
      TicketsFindByIdQueryHandler,
      TicketsFindByHeadingQueryHandler,
      {
        provide: TICKETS_LIST_REPOSITORY_TOKEN,
        useClass: TicketsRepositoryEmpl,
      },
    ],
    exports: [TICKETS_LIST_REPOSITORY_TOKEN], // Export for use in other modules
  })
  export class TicketsModule {}
  
