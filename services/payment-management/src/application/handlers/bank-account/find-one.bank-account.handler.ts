import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindOneBankAccountQuery } from "src/application/queries/bank-accounts/find-one.query";
import { BankAccountsServices } from "src/application/services/bank-accounts/bank-accounts.service";
import { BankAccounts } from "src/domain/entities/bank_accounts.entity";

@QueryHandler(FindOneBankAccountQuery)

export class FindOneBankAccountHandler implements IQueryHandler<FindOneBankAccountQuery>{
    constructor(
        private readonly bankAccountService: BankAccountsServices
    ){}
    async execute(query: FindOneBankAccountQuery): Promise<BankAccounts>{
        const {id} = query;
        return await this.bankAccountService.findOne(id);
    }
}