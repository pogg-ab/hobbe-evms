import { CreateBankAccountDto } from "src/presentation/dtos/bank-accounts/create-bank-acounts.dto";
import { BankAccounts } from "../../entities/bank_accounts.entity";




export interface IBankAccountRepository{
    create(user:any, event:string, createBankAccountDto: CreateBankAccountDto): Promise<BankAccounts>;
    findOne(id:string):Promise<BankAccounts | null>
    findByEvent(event:any):Promise<BankAccounts[] | null>
    update(id:string,bank_account: BankAccounts): Promise<BankAccounts>
    delete(id:string): Promise<void>
}