import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { EventShareController } from 'src/presentation/controllers/event-share/event-share.controller'; 
import { EventShare } from 'src/domain/entities/event-share.entity'; 
import { EventSharingService } from 'src/application/services/event-sharing/event-sharing.service';
import { EventShareProfile } from 'src/application/mappers/event-share.profile';
import { SocketIo } from 'src/infrastructure/socket-io/socket.gateway'; 
import { CreateShareEventCommandHandler } from 'src/application/handlers/event-sharing/create-share-event.command-handler';
import { EVENT_SHARING_REPOSITORY_TOKEN } from 'src/domain/repositories/event-sharing/event-sharing.repository.token';
import { EventShareRepository } from 'src/infrastructure/persistence/repositories/event-sharing.repository.impl';
@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([EventShare]),
    CqrsModule,
  ],
  controllers: [
    EventShareController, 
  ],
  providers: [
    EventSharingService, 
    SocketIo, 
    EventShareProfile,
    CreateShareEventCommandHandler,
    {
      provide: EVENT_SHARING_REPOSITORY_TOKEN, 
      useClass: EventShareRepository, 
    },
  ],
  exports: [EVENT_SHARING_REPOSITORY_TOKEN], 
})
export class EventShareModule {}
