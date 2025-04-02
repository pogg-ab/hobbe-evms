import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { EventsService } from "../../services/events/events.service";
import { Events } from "src/domain/entities/events.entity";
import { GetAllEventsByAuthQuery } from "src/application/queries/events/get-all-events-by-auth.query";


@QueryHandler(GetAllEventsByAuthQuery)
export class GetAllEventsByAuthQueryHandler
  implements IQueryHandler<GetAllEventsByAuthQuery>
{
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  async execute(query:GetAllEventsByAuthQuery): Promise<{events:Events[]|null,total: number; page: number; limit: number}> {
    const {user,page,limit} = query;
    return this.eventsService.findAllByAuth(user,page, limit);

  }
}
