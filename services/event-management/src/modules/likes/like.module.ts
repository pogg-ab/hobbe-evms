import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { Like } from 'src/domain/entities/likes.entity';
import { LikeController } from 'src/presentation/controllers/like/like.controller';
import { LikeEventService } from 'src/application/services/like/like-event.service';
import { LikeEventCommandHandler } from 'src/application/handlers/like/like-event-handler';
import { LIKE_EVENT_TOKEN } from 'src/domain/repositories/like/like-event.repositort.token';
import { LikeEventRepositoryImpl } from 'src/infrastructure/persistence/repositories/like-event.repository.impl';
import { SocketIo } from 'src/infrastructure/socket-io/socket.gateway';

@Module({
  
    imports: [
      AutomapperModule,
      TypeOrmModule.forFeature([Like]),
      CqrsModule,
    ],
    controllers: [LikeController],
    providers: [
      LikeEventService,
      SocketIo,
      LikeEventCommandHandler,
      {
        provide: LIKE_EVENT_TOKEN,
        useClass: LikeEventRepositoryImpl,
      },
    ],
    exports: [LIKE_EVENT_TOKEN], // Export for use in other modules
  })
  export class LikeModule {}
  
