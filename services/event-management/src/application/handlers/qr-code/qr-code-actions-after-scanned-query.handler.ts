  //  get all events scanned logs grouped by ticket_id on date range
  // aggregate by day,week,month,year of all scanned logs grouped by ticket_id

import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { QrAfterScannedActionsAggregateQuery } from "src/application/queries/qr-code/qr-code-actions-ater-scanned.query";
import { TicketsService } from "src/application/services/tickets/tickets.service";


@QueryHandler(QrAfterScannedActionsAggregateQuery)
  export class QrAfterScannedActionsAggregateQueryHandler implements IQueryHandler<QrAfterScannedActionsAggregateQuery> {
    constructor(
      public readonly ticketsService: TicketsService, // Assuming you have a service to handle ticket operations
    ) {}

    async execute(query: QrAfterScannedActionsAggregateQuery): Promise<any> {
      const { dto } = query;

      // Logic to aggregate scanned logs based on the provided dto
      const acctions = await this.ticketsService.qrAfterScannedActionsAggregate(dto);
      
      return acctions;
    }
  }