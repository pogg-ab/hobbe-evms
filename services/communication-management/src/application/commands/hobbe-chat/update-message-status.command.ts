import { ICommand } from "@nestjs/cqrs";

export class SendMessageCommand implements ICommand {
  constructor(public readonly chatId: string, public readonly senderId: string, public readonly content: string) {}
}
