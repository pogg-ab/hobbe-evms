import { ICommand } from "@nestjs/cqrs";

export class CreateChatCommand implements ICommand{
    constructor(
      public readonly userId: string,
      public readonly friendId?: string,
      public readonly type ?: string,
      public readonly name?: string
    ) {}
  }
  