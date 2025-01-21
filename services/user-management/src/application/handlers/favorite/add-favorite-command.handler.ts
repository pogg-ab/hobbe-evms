import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddFavoriteCommand } from 'src/application/commands/favorite/add-favorite.command';
import { FavoriteService } from 'src/application/services/favorite.service';
import { Favorite } from 'src/domain/entities/favorite.entity';

@CommandHandler(AddFavoriteCommand)
export class AddFavoritesCommandHandler
  implements ICommandHandler<AddFavoriteCommand>
{
  constructor(private readonly favoriteService: FavoriteService) {}

  async execute(command: AddFavoriteCommand): Promise<Favorite> {
    return this.favoriteService.addFavorite(command.createFavoriteDto);
  }
}
