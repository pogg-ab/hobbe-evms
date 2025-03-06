import { ICommand } from "@nestjs/cqrs";

export class DeleteChatCommand implements ICommand {
    constructor(public readonly chatId: string) {}
  }
  