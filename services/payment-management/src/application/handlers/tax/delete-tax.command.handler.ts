import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TaxService } from 'src/application/services/tax/tax.service';
import { DeleteTaxCommand } from 'src/application/commands/tax/delete-tax.command';

@CommandHandler(DeleteTaxCommand)
export class DeleteTaxCommandHandler implements ICommandHandler<DeleteTaxCommand> {
    constructor(private readonly taxService: TaxService) { }

    async execute(command: DeleteTaxCommand): Promise<void> {
        await this.taxService.deleteTax(command.taxId, command.userId);
    }
}