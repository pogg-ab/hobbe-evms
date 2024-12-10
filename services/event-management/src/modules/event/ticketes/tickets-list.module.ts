import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { TicketsList } from 'src/domain/entities/tickets_list.entity';
import { TicketsListController } from 'src/presentation/controllers/ticets-list/ticets-list.controller';
import { TicketsListService } from 'src/application/services/tickets/ticketslist.service';
import { TicktesListProfile } from 'src/application/mappers/tickets-list.profile';
import { TICKETS_LIST_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/ticketslist.repository.token';
import { TicketsListRepositoryEmpl } from 'src/infrastructure/persistence/repositories/ticketslist.repository.impl';
import { GetAllTicketsListHandler } from 'src/application/handlers/tickets/get-all-events-ticketslist.handler';
import { TicketsListFindByIdQueryHandler } from 'src/application/handlers/tickets/findone-ticketslist.handler';
import { GetAllTicketsListQueryHandler } from 'src/application/handlers/tickets/get-all-ticketslist.handler';
import { CreateTicketsCommandHandler } from 'src/application/handlers/tickets/create-tickets.handler';
import { CreateTicketsListCommandHandler } from 'src/application/handlers/tickets/create-ticketslist.handler';

@Module({
  
    imports: [
      AutomapperModule,
      TypeOrmModule.forFeature([TicketsList]),
      CqrsModule,
    ],
    controllers: [TicketsListController],
    providers: [
      TicketsListService,
      TicktesListProfile,
      CreateTicketsListCommandHandler,

      GetAllTicketsListQueryHandler,
      GetAllTicketsListHandler,
      TicketsListFindByIdQueryHandler,
      {
        provide: TICKETS_LIST_REPOSITORY_TOKEN,
        useClass: TicketsListRepositoryEmpl,
      },
    ],
    exports: [TICKETS_LIST_REPOSITORY_TOKEN], // Export for use in other modules
  })
  export class TicketsListModule {}
  
