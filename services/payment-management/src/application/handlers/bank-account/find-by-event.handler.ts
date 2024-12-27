import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindBankAccountByEventQuery } from "src/application/queries/bank-accounts/find-by-event.query";
import { BankAccountsServices } from "src/application/services/bank-accounts/bank-accounts.service";
import { BankAccounts } from "src/domain/entities/bank_accounts.entity";


@QueryHandler(FindBankAccountByEventQuery)

export class FindBankAccountByEventQueryHandler implements IQueryHandler<FindBankAccountByEventQuery>{
    constructor(
        private readonly bankAccountService: BankAccountsServices
    ){}
    async execute(query: FindBankAccountByEventQuery): Promise<BankAccounts[]>{
        const {event} = query;
        return await this.bankAccountService.findByEvent(event);
    }
    
}