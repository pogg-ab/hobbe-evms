import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteBankAccountCommand } from "src/application/commands/bank-accounts/delete.bank-account.command";
import { BankAccountsServices } from "src/application/services/bank-accounts/bank-accounts.service";


@CommandHandler(DeleteBankAccountCommand)

export class DeleteBankAccountHandler implements ICommandHandler<DeleteBankAccountCommand> {
    constructor(
        private readonly bankAccountsService: BankAccountsServices
    ){}

    async execute(command: DeleteBankAccountCommand): Promise<void> {
        return await this.bankAccountsService.delete(command.id);
    }
}