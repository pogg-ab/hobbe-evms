import { ICommand } from "@nestjs/cqrs";

export class RemoveChatMemberCommand implements ICommand {
    constructor(public readonly chatId: string, public readonly userId: string) {}
  }
  