import { ICommand } from "@nestjs/cqrs";

export class RemoveFavoriteCommand implements ICommand {
  constructor(
    public readonly favoritingUserId: string,
    public readonly favoritedUserId: string,
  ) {}
}

  