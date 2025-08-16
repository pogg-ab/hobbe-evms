import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Favorite } from 'src/domain/entities/favorite.entity';
import { User } from 'src/domain/entities/user.entity';
import { FavoriteController } from 'src/presentation/controllers/favorite.controller';
import { FavoriteRepositoryImpl } from 'src/infrastructure/persistence/repositories/favorite.repository.impl';
import { FAVORITE_REPOSITORY_TOKEN } from 'src/domain/repositories/favorite.repository.token';
import { FavoriteService } from 'src/application/services/favorite.service';
import { FavoriteProfile } from 'src/application/mappers/favorite.profile';
import { AutomapperModule } from '@automapper/nestjs';
import { FindUserFavoritesQuery } from 'src/application/queries/favorite/get-favorites.query';
import { CreateFavoriteCommand } from 'src/application/commands/favorite/add-favorite.command';
import { RemoveFavoriteCommand } from 'src/application/commands/favorite/remove-favorite.command';
import { FindFavoritedByQuery } from 'src/application/queries/favorite/get-favorited-by.query';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { UserRepositoryImpl } from 'src/infrastructure/persistence/repositories/user.repository.impl';
import { CreateFavoriteCommandHandler } from 'src/application/handlers/favorite/add-favorite-command.handler';
import { RemoveFavoriteCommandHandler } from 'src/application/handlers/favorite/remove-favorite-command.handler';
import { FindUserFavoritesQueryHandler } from 'src/application/handlers/favorite/get-favorites-query.handler';
import { FindFavoritedByQueryHandler } from 'src/application/handlers/favorite/get-favorited-by-query.handler';
import { Follower } from 'src/domain/entities/follower.entity';
import { FOLLOWER_REPOSITORY_TOKEN } from 'src/domain/repositories/follower.repository.token';
import { FollowerRepositoryImpl } from 'src/infrastructure/persistence/repositories/follower.repository.impl';
import { ElasticsearchConfig } from 'src/infrastructure/elasticsearch/elasticsearch.config';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([
      Favorite,
      User,
      Follower,
      PersonalAccount,
      OrganizationalAccount,
    ]),
    CqrsModule,
  ],
  controllers: [FavoriteController],
  providers: [
    FavoriteService,
    ElasticsearchConfig,
    CreateFavoriteCommand,
    RemoveFavoriteCommand,
    FindUserFavoritesQuery,
    FindFavoritedByQuery,
    CreateFavoriteCommandHandler,
    RemoveFavoriteCommandHandler,
    FindUserFavoritesQueryHandler,
    FindFavoritedByQueryHandler,
    FavoriteProfile,
    {
      provide: FAVORITE_REPOSITORY_TOKEN,
      useClass: FavoriteRepositoryImpl,
    },
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepositoryImpl,
    },
    {
      provide: FOLLOWER_REPOSITORY_TOKEN,
      useClass: FollowerRepositoryImpl,
    },
  ],
})
export class FavoritesModule {}
