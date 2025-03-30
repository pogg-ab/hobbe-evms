import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllTicketsQuery } from "src/application/queries/tickets/get-all-tickets.query";
import { TicketsService } from "src/application/services/tickets/tickets.service";
import { Tickets } from "src/domain/entities/tickets.entity";

@QueryHandler(GetAllTicketsQuery)
export class GetAllTicketsQueryHandler implements IQueryHandler<GetAllTicketsQuery> {
  constructor(
    private readonly ticketsService: TicketsService,  // inject your service here
  ) { }
  execute(query: GetAllTicketsQuery): Promise<{ tickets: Tickets[] | null, total: number; page: number; limit: number }> {
    const { page, limit } = query;
    return this.ticketsService.findAll(page, limit);
  }
}