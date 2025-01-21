import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddFavoriteCommand } from 'src/application/commands/favorite/add-favorite.command';
import { FavoriteService } from 'src/application/services/favorite.service';

@CommandHandler(AddFavoriteCommand)
export class AddFavoriteHandler implements ICommandHandler<AddFavoriteCommand> {
  constructor(private readonly favoriteService: FavoriteService) {}

  async execute(command: AddFavoriteCommand): Promise<void> {
    const { createFavoriteDto } = command;
    await this.favoriteService.addFavorite(createFavoriteDto);
  }
}
