import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { FavoriteController } from 'src/presentation/controllers/favorite/favorite.controller';
import { Favorite } from 'src/domain/entities/favorite.entity';
import { FavoriteEventService } from 'src/application/services/favorite/favorite-event.service';
import { FAVORITE_EVENT_TOKEN } from 'src/domain/repositories/favorite/favorite-event.repositort.token';
import { FavoriteEventRepositoryImpl } from 'src/infrastructure/persistence/repositories/favorite-event.repository.impl';
import { SocketIo } from 'src/infrastructure/socket-io/socket.gateway';
import { FavoriteCommandHandler } from 'src/application/handlers/favorite/favorite-event-handler';
import { FindEventsByUsersFavoriteQueryHandler } from 'src/application/handlers/favorite/find-events-by-user.favorite.handler';

@Module({
  
    imports: [
      AutomapperModule,
      TypeOrmModule.forFeature([Favorite]),
      CqrsModule,
    ],
    controllers: [FavoriteController],
    providers: [
      FavoriteEventService,
      SocketIo,
      FavoriteCommandHandler,
      FindEventsByUsersFavoriteQueryHandler,
      {
        provide: FAVORITE_EVENT_TOKEN,
        useClass: FavoriteEventRepositoryImpl,
      },
    ],
    exports: [FAVORITE_EVENT_TOKEN], // Export for use in other modules
  })
  export class FavoriteModule {}
  
