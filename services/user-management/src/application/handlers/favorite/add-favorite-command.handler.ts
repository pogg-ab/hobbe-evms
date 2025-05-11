import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Favorite } from 'src/domain/entities/favorite.entity';
import { FavoriteService } from 'src/application/services/favorite.service';  // Assuming the service exists
import { CreateFavoriteCommand } from 'src/application/commands/favorite/add-favorite.command';

@CommandHandler(CreateFavoriteCommand)
export class CreateFavoriteCommandHandler
  implements ICommandHandler<CreateFavoriteCommand> {
  constructor(private readonly favoriteService: FavoriteService) {}

  async execute(command: CreateFavoriteCommand): Promise<Favorite> {
    const { createFavoriteDto } = command;
    return this.favoriteService.create(createFavoriteDto);  
  }
}
