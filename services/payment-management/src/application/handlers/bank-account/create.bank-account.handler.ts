import { CommandHandler } from "@nestjs/cqrs";
import { CreateBankAccountCommand } from "src/application/commands/bank-accounts/create.bank-account.command";
import { BankAccountsServices } from "src/application/services/bank-accounts/bank-accounts.service";
import { BankAccounts } from "src/domain/entities/bank_accounts.entity";


@CommandHandler(CreateBankAccountCommand)

export class CreateBankAccountHandler{
    constructor(
        private readonly bankAccountService: BankAccountsServices
    ){}
    async execute(command: CreateBankAccountCommand): Promise<BankAccounts>{
        const {user,event,createBankAccountDto} = command;
        return await this.bankAccountService.create(user,event,createBankAccountDto);
    }
}