import { ICommand } from "@nestjs/cqrs";
import { CreateFavoriteDto } from "src/presentation/dtos/create-favorite.dto";

export class AddFavoriteCommand implements ICommand {
  constructor(
    public readonly createFavoriteDto: CreateFavoriteDto
  ) {}
}
