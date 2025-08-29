import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TaxService } from 'src/application/services/tax/tax.service';
import { UpdateTaxCommand } from 'src/application/commands/tax/update-tax.command';
import { Tax } from 'src/domain/entities/tax.entity';

@CommandHandler(UpdateTaxCommand)
export class UpdateTaxCommandHandler implements ICommandHandler<UpdateTaxCommand> {
    constructor(private readonly taxService: TaxService) { }

    async execute(command: UpdateTaxCommand): Promise<Tax> {
        return await this.taxService.updateTax(
            command.taxId,
            command.updateTaxDto,
            command.userId,
        );
    }
}