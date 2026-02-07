import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindUserFavoritesQuery } from 'src/application/queries/favorite/get-favorites.query';
import { FavoriteService } from 'src/application/services/favorite.service';
import { Favorite } from 'src/domain/entities/favorite.entity';

@QueryHandler(FindUserFavoritesQuery)
export class FindUserFavoritesQueryHandler
  implements IQueryHandler<FindUserFavoritesQuery>
{
  constructor(private readonly favoriteService: FavoriteService) {}

  async execute(query: FindUserFavoritesQuery): Promise<{
    favoriteUsers: Favorite[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    const { userId, page, limit } = query;
    return this.favoriteService.findUserFavorites(userId, page, limit);
  }
}
