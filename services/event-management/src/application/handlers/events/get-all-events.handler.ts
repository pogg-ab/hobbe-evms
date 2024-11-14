import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllEventsQuery } from "../../queries/events/get-all-events.query";
import { EventsService } from "../../services/events/events.service";
import { Events } from "src/domain/entities/events.entity";


@QueryHandler(GetAllEventsQuery)
export class GetAllEventsQueryHandler
  implements IQueryHandler<GetAllEventsQuery>
{
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  async execute(): Promise<Events[]> {
    return this.eventsService.findAll();
  }
}
