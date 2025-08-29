import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EventsService } from 'src/application/services/events/events.service';
import { GetTicketSalesOverviewQuery } from 'src/application/queries/events/get-ticket-sales-overview.query';
import { TicketSalesOverviewResponseDto } from 'src/presentation/dtos/events/ticket-sales-overview-response.dto';

@QueryHandler(GetTicketSalesOverviewQuery)
export class GetTicketSalesOverviewQueryHandler
  implements IQueryHandler<GetTicketSalesOverviewQuery>
{
  constructor(private readonly eventsService: EventsService) {}

  async execute(
    query: GetTicketSalesOverviewQuery,
  ): Promise<TicketSalesOverviewResponseDto> {
    return await this.eventsService.getTicketSalesOverview(query.eventId);
  }
}
