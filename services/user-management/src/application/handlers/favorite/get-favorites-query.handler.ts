import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFavoritesQuery } from 'src/application/queries/favorite/get-favorites.query';
import { FavoriteService } from 'src/application/services/favorite.service';
import { CreateFavoriteDto } from 'src/presentation/dtos/create-favorite.dto';

@QueryHandler(GetFavoritesQuery)
export class GetFavoritesQueryHandler
  implements IQueryHandler<GetFavoritesQuery>
{
  constructor(private readonly favoriteService: FavoriteService) {}

  async execute(query: GetFavoritesQuery): Promise<CreateFavoriteDto[]> {
    return this.favoriteService.getFavorites(query.userId);
  }
}
