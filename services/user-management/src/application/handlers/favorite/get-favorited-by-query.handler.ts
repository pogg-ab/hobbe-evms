import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFavoritedByQuery } from 'src/application/queries/favorite/get-favorited-by.query';
import { FavoriteService } from 'src/application/services/favorite.service';
import { CreateFavoriteDto } from 'src/presentation/dtos/create-favorite.dto';

@QueryHandler(GetFavoritedByQuery)
export class GetFavoritedByQueryHandler
  implements IQueryHandler<GetFavoritedByQuery>
{
  constructor(private readonly favoriteService: FavoriteService) {}

  async execute(query: GetFavoritedByQuery): Promise<CreateFavoriteDto[]> {
    return this.favoriteService.getFavoritedBy(query.userId);
  }
}
