import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { QrCodeScannedLogCommand } from "src/application/commands/qr-code/qr-scanned-log.command";
import { TicketsService } from "src/application/services/tickets/tickets.service";


@CommandHandler(QrCodeScannedLogCommand)
export class QrCodeScannedLogHandler implements ICommandHandler<QrCodeScannedLogCommand> {
  constructor(
    private readonly ticketsService: TicketsService, // Assuming you have a service to handle ticket operations
  ) {}
    execute(command: QrCodeScannedLogCommand): Promise<any> {
        // Logic to handle the command, e.g., saving the scanned log to the database
        // This is just a placeholder; actual implementation will depend on your application structure
        return this.ticketsService.qrCodeScannedLog(command.ticket_id, command.metadata);
    }
  
}