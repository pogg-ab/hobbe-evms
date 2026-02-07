
import { QrAfterScannedActionsAggregateDto } from "src/presentation/dtos/qr-code/qr-scaned-after-scanned-action-aggregate.dto";

  export class QrAfterScannedActionsAggregateQuery {
    constructor(
      public readonly dto: QrAfterScannedActionsAggregateDto,
    ) {}
  }