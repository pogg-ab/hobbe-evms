import { QueryHandler } from "@nestjs/cqrs";
import { CountQrCodeScannedLogsQuery } from "../../queries/qr-code/count-qr-code-scanned-logs.query";
import { TicketsService } from "../../services/tickets/tickets.service";

@QueryHandler(CountQrCodeScannedLogsQuery)

export class CountQrCodeScannedLogsQueryHandler {
  constructor(
    public readonly ticketsService: TicketsService, // Assuming you have a service to handle ticket operations
  ) {}

  async execute(query: CountQrCodeScannedLogsQuery): Promise<any> {
     const { event_id } = query;

    // Logic to count the scanned logs for the given event_id
    const scannedLogs = await this.ticketsService.countQrCodeScannedLogs(event_id);
    
    return scannedLogs;
  }
}