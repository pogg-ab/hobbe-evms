import { CommandHandler } from "@nestjs/cqrs";
import { QrCodeLogAfterScannedCommand } from "src/application/commands/qr-code/qr-code-log-after-scanned.command ";
import { TicketsService } from "src/application/services/tickets/tickets.service";


@CommandHandler(QrCodeLogAfterScannedCommand)
export class QrCodeLogAfterScannedCommandHandler {
  constructor(
    private readonly ticketsService: TicketsService, // Assuming you have a service to handle ticket operations
  ) {}

  async execute(command: QrCodeLogAfterScannedCommand): Promise<any> {
    const { dto } = command;

    // Logic to handle the command, e.g., updating the scanned log in the database
    return this.ticketsService.qrCodeLogAfterScanned(dto);
  }
}