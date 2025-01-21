import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Favorite } from 'src/domain/entities/favorite.entity';
import { User } from 'src/domain/entities/user.entity';
import { FavoritesController } from 'src/presentation/controllers/favorite.controller';
import { FavoriteRepository } from 'src/infrastructure/persistence/repositories/favorite.repository.impl';
import { FAVORITE_REPOSITORY_TOKEN } from 'src/domain/repositories/favorite.repository.token';
import { FavoriteService } from 'src/application/services/favorite.service';
import { AddFavoritesCommandHandler } from 'src/application/handlers/favorite/add-favorite-command.handler';
import { RemoveFavoriteCommandHandler } from 'src/application/handlers/favorite/remove-favorite-command.handler';
import { GetFavoritesQueryHandler } from 'src/application/handlers/favorite/get-favorites-query.handler';
import { GetFavoritedByQueryHandler } from 'src/application/handlers/favorite/get-favorited-by-query.handler';

@Module({
    imports: [
        TypeOrmModule.forFeature([Favorite, User]),
        CqrsModule,
    ],
    controllers: [FavoritesController],
    providers: [
        FavoriteService,
        AddFavoritesCommandHandler,
        RemoveFavoriteCommandHandler,
        GetFavoritesQueryHandler,
        GetFavoritedByQueryHandler,
        {
            provide: FAVORITE_REPOSITORY_TOKEN,  
            useClass: FavoriteRepository,      
        },
    ],
})
export class FavoritesModule { }
