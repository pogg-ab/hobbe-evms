import { IQuery } from '@nestjs/cqrs';

export class GetMessagesQuery implements IQuery {
  constructor(public readonly chatId: string) {}
}
