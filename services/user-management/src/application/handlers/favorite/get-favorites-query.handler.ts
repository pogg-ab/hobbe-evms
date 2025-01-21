import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFavoritesQuery } from 'src/application/queries/favorite/get-favorites.query';
import { FavoriteService } from 'src/application/services/favorite.service';
import { Favorite } from 'src/domain/entities/favorite.entity';

@QueryHandler(GetFavoritesQuery)
export class GetFavoritesHandler implements IQueryHandler<GetFavoritesQuery> {
  constructor(private readonly favoriteService: FavoriteService) {}

  async execute(query: GetFavoritesQuery): Promise<Favorite[]> {
    return this.favoriteService.getFavorites(query.userId);
  }
}
