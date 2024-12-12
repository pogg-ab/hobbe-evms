import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllEventsQuery } from "../../queries/events/get-all-events.query";
import { EventsService } from "../../services/events/events.service";
import { Events } from "src/domain/entities/events.entity";
import { query } from "express";


@QueryHandler(GetAllEventsQuery)
export class GetAllEventsQueryHandler
  implements IQueryHandler<GetAllEventsQuery>
{
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  async execute(query:GetAllEventsQuery): Promise<{events:Events[]|null,total: number; page: number; limit: number}> {
    const {page,limit} = query;
    return this.eventsService.findAll(page, limit);
  }
}
