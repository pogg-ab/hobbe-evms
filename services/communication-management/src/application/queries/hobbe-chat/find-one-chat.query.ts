import { IQuery } from "@nestjs/cqrs";

export class FindChatByIdQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly chatId: string
) {}
}