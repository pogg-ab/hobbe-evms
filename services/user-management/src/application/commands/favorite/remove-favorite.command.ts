import { ICommand } from "@nestjs/cqrs";
import { CreateFavoriteDto } from "src/presentation/dtos/create-favorite.dto";

export class RemoveFavoriteCommand implements ICommand {
  constructor(
    public readonly createFavoriteDto: CreateFavoriteDto
  ) {}
}
  