import { ICommand } from "@nestjs/cqrs";

export class AddChatMemberCommand implements ICommand {
    constructor(public readonly chatId: string, public readonly userId: string) {}
  }
  