import { IQuery } from '@nestjs/cqrs';

export class GetVerificationStatusQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
