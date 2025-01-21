import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveFavoriteCommand } from 'src/application/commands/favorite/remove-favorite.command';
import { FavoritesService } from 'src/application/services/favorite.service';

@CommandHandler(RemoveFavoriteCommand)
export class RemoveFavoriteCommandHandler implements ICommandHandler<RemoveFavoriteCommand> {
  constructor(private readonly favoritesService: FavoritesService) {}

  async execute(command: RemoveFavoriteCommand): Promise<void> {
    const { userId, favoriteUserId } = command;
    await this.favoritesService.removeFavorite(userId, favoriteUserId);
  }
}
