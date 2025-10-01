import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { RemoveFavoriteCommand } from 'src/application/commands/favorite/remove-favorite.command';
import { FavoriteService } from 'src/application/services/favorite.service';

@CommandHandler(RemoveFavoriteCommand)
export class RemoveFavoriteCommandHandler
  implements ICommandHandler<RemoveFavoriteCommand>
{
  constructor(private readonly favoriteService: FavoriteService) {}

  async execute(command: RemoveFavoriteCommand): Promise<void> {
    const { favoritingUserId, favoritedUserId } = command;
    return this.favoriteService.remove(favoritingUserId, favoritedUserId);
  }
}
