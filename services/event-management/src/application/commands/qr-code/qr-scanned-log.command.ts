import { ICommand } from "@nestjs/cqrs";


export class QrCodeScannedLogCommand implements ICommand{
    constructor(
        public readonly ticket_id: string,
        public readonly metadata: string, // optional data like IP address, device, etc.
    ) {}

}