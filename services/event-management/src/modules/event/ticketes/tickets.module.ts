import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateTicketsCommandHandler } from 'src/application/handlers/tickets/create-tickets.handler';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { TicketsController } from 'src/presentation/controllers/tickets/tickets.controller';
import { TicketsService } from 'src/application/services/tickets/tickets.service';
import { TicktesProfile } from 'src/application/mappers/tickets.profile';
import { TicketsRepositoryEmpl } from 'src/infrastructure/persistence/repositories/tickets.repository.impl';
import { CREATE_TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/tickets.repository.token';
import { EventsModule } from '../events.module';
import { GetAllTicketsQueryHandler } from 'src/application/handlers/tickets/get-all-tickets.handler';
import { FindOneTicketQueryHandler } from 'src/application/handlers/tickets/find-one-tickets.handler';
import { UpdatedTicketHeadingCommandHandler } from 'src/application/queries/tickets/update-ticket-heading.handler';

@Module({
    imports: [
        
      AutomapperModule,
      TypeOrmModule.forFeature([Tickets]),
      forwardRef(() => EventsModule),
      CqrsModule,
    ],
    controllers: [TicketsController],
    providers: [
      TicketsService,
      TicktesProfile,
      CreateTicketsCommandHandler,
      GetAllTicketsQueryHandler,
      FindOneTicketQueryHandler,
      UpdatedTicketHeadingCommandHandler,
      {
        provide: "CREATE_TICKET_REPOSITORY_TOKEN",
        useClass: TicketsRepositoryEmpl,
      },
    ],
    exports: [CREATE_TICKET_REPOSITORY_TOKEN],
  })
  export class TicketsModule {}
  
  
