import { ICommand } from "@nestjs/cqrs";
import { QrCodeActionAfterScannedDto } from "src/presentation/dtos/qr-code/qr-code-action-after-scanned.dto";


export class QrCodeLogAfterScannedCommand implements ICommand{
    constructor(
       public readonly dto: QrCodeActionAfterScannedDto,
    ) {}

}