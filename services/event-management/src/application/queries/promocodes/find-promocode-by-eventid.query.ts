import { IQuery } from '@nestjs/cqrs';

export class FindPromocodeByEventIdQuery implements IQuery {
    constructor(public readonly eventId: string) { }
}