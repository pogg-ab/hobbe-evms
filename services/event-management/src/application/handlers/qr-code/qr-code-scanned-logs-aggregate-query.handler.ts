  //  get all events scanned logs grouped by ticket_id on date range
  // aggregate by day,week,month,year of all scanned logs grouped by ticket_id

import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { QrScannedAggregateQuery } from "src/application/queries/qr-code/aggregate-qr-code-scanned-logs.query.";
import { TicketsService } from "src/application/services/tickets/tickets.service";


@QueryHandler(QrScannedAggregateQuery)
  export class QrScannedAggregateQueryHandler implements IQueryHandler<QrScannedAggregateQuery> {
    constructor(
      public readonly ticketsService: TicketsService, // Assuming you have a service to handle ticket operations
    ) {}

    async execute(query: QrScannedAggregateQuery): Promise<any> {
      const { dto } = query;

      // Logic to aggregate scanned logs based on the provided dto
      const aggregatedLogs = await this.ticketsService.aggregateQrCodeScannedLogs(dto);
      
      return aggregatedLogs;
    }
  }