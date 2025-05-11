import { ICommandHandler, CommandHandler } from "@nestjs/cqrs";
import { UpdateBankAccountCommand } from "src/application/commands/bank-accounts/update.bank-account.command";
import { BankAccountsServices } from "src/application/services/bank-accounts/bank-accounts.service";
import { IBankAccountRepository } from "src/domain/repositories/bank-accouts/bank-account.repository";


@CommandHandler(UpdateBankAccountCommand)

export class UpdateBankAccountHandler implements ICommandHandler<UpdateBankAccountCommand> {
    constructor(
        private readonly bankAccounService: BankAccountsServices
    ) {}
    
    async execute(command: UpdateBankAccountCommand) {
        const { id, createBankAccountDto } = command;
        return await this.bankAccounService.update(id, createBankAccountDto);
    }
}