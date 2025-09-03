
  //  get all events scanned logs grouped by ticket_id on date range
  // aggregate by day,week,month,year of all scanned logs grouped by ticket_id

import { QrScannedAggregateDto } from "src/presentation/dtos/qr-code/qr-scaned-aggregate.dto";

  export class QrScannedAggregateQuery {
    constructor(
      public readonly dto: QrScannedAggregateDto,
    ) {}

  }