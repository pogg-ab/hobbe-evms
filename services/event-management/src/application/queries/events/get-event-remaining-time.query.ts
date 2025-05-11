import { IQuery } from '@nestjs/cqrs';

export class GetEventRemainingTimeQuery implements IQuery {
    constructor(public readonly event_id: string) { }
}