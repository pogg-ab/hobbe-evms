import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { TicketsHeading } from 'src/domain/entities/tickets-heading.entity';
import { TicketsHeadingController } from 'src/presentation/controllers/tickets-heading/tickets-heading.controller';
import { TicketsHeadingService } from 'src/application/services/tickets/tickets-heading.service';
import { TicktesHeadingProfile } from 'src/application/mappers/tickets-heading.profile';
import { TicketsHeadingRepositoryEmpl } from 'src/infrastructure/persistence/repositories/tickets-heading.repository.impl';
import { CREATE_TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/tickets.repository.token';
import { EventsModule } from '../events.module';
import { GetAllTicketsByHeadingQueryHandler } from 'src/application/handlers/tickets/get-all-tickets-by-heading.handler';
import { FindOneTicketsHeadingQueryHandler } from 'src/application/handlers/tickets/find-one-tickets-heading.handler';
import { UpdatedTicketHeadingCommandHandler } from 'src/application/handlers/tickets/update-ticket-heading.handler';
import { CreateTicketsHeadingCommandHandler } from 'src/application/handlers/tickets/create-tickets-heading.handler';
import { ActivateTicketsByHeadingCommandHandler } from 'src/application/handlers/tickets/activate-tickets-by-heading.handler';

@Module({
    imports: [
        
      AutomapperModule,
      TypeOrmModule.forFeature([TicketsHeading]),
      forwardRef(() => EventsModule),
      CqrsModule,
    ],
    controllers: [TicketsHeadingController],
    providers: [
      TicketsHeadingService,
      TicktesHeadingProfile,
      CreateTicketsHeadingCommandHandler,
      GetAllTicketsByHeadingQueryHandler,
      FindOneTicketsHeadingQueryHandler,
      UpdatedTicketHeadingCommandHandler,
      ActivateTicketsByHeadingCommandHandler,
      {
        provide: "CREATE_TICKET_REPOSITORY_TOKEN",
        useClass: TicketsHeadingRepositoryEmpl,
      },
    ],
    exports: [CREATE_TICKET_REPOSITORY_TOKEN],
  })
  export class TicketsHeadingModule {}
  
  
