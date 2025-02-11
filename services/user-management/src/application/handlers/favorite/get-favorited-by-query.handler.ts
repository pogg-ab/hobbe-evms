import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindFavoritedByQuery } from 'src/application/queries/favorite/get-favorited-by.query';
import { FavoriteService } from 'src/application/services/favorite.service';  // Assuming the service exists
import { Favorite } from 'src/domain/entities/favorite.entity';

@QueryHandler(FindFavoritedByQuery)
export class FindFavoritedByQueryHandler
  implements IQueryHandler<FindFavoritedByQuery> {
  constructor(private readonly favoriteService: FavoriteService) { }

  async execute(query: FindFavoritedByQuery): Promise<
    {
      favoritedByUsers: Favorite[] | null;
      total: number;
      page: number;
      limit: number;
    }> {
    const { userId, page, limit } = query;
    return this.favoriteService.findFavoritedBy(userId, page, limit,);
  }
}
