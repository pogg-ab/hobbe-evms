import { IQuery } from "@nestjs/cqrs";


export class FindEventsByOrganiserQuery implements IQuery {
  constructor(public readonly organiser: string) {}
}