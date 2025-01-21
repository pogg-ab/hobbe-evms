import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFavoritedByQuery } from 'src/application/queries/favorite/get-favorited-by.query';
import { FavoriteService} from 'src/application/services/favorite.service';
import { Favorite } from 'src/domain/entities/favorite.entity';

@QueryHandler(GetFavoritedByQuery)
export class GetFavoritedByHandler implements IQueryHandler<GetFavoritedByQuery> {
  constructor(private readonly favoriteService: FavoriteService) {}

  async execute(query: GetFavoritedByQuery): Promise<Favorite[]> {
    return this.favoriteService.getFavoritedBy(query.userId);
  }
}
