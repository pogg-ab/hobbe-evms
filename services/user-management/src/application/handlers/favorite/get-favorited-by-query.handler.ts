import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindFavoritedByQuery } from 'src/application/queries/favorite/get-favorited-by.query';
import { FavoriteService } from 'src/application/services/favorite.service';  // Assuming the service exists
import { Favorite } from 'src/domain/entities/favorite.entity';

@QueryHandler(FindFavoritedByQuery)
export class FindFavoritedByQueryHandler
  implements IQueryHandler<FindFavoritedByQuery> {
  constructor(private readonly favoriteService: FavoriteService) {}

  async execute(query: FindFavoritedByQuery): Promise<Favorite[]> {
    return this.favoriteService.findFavoritedBy(query.userId); 
  }
}
