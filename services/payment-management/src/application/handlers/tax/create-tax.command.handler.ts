import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TaxService } from 'src/application/services/tax/tax.service';
import { CreateTaxCommand } from 'src/application/commands/tax/create-tax.command';
import { Tax } from 'src/domain/entities/tax.entity';

@CommandHandler(CreateTaxCommand)
export class CreateTaxCommandHandler implements ICommandHandler<CreateTaxCommand> {
    constructor(private readonly taxService: TaxService) { }

    async execute(command: CreateTaxCommand): Promise<Tax> {
        return await this.taxService.createTax(command.createTaxDto, command.userId);
    }
}