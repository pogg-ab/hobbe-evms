import { CreateBankAccountDto } from "src/presentation/dtos/bank-accounts/create-bank-acounts.dto";
import { BankAccounts } from "../../entities/bank_accounts.entity";




export interface IBankAccountRepository{
    createFromEventMS(accounts: BankAccounts[]): Promise<BankAccounts[]>;
    create(createBankAccountDto: CreateBankAccountDto): Promise<BankAccounts>;
    // findAll( page:number, limit:number):Promise<{events:Events[]| null,total: number; page: number; limit: number}>
    // findOne(id:string):Promise<Events | null>
    // findByCategory(category:string):Promise<Events[]>
    // findByLocation(location:string):Promise<Events[]>
    // update(id:string,event: Events,user: any): Promise<Events>
    // delete(id:string): Promise<void>

    // // searching for events
    // search(keyword:string,page:number,limit:number):Promise<{events:Events[] | null,total:number, page: number; limit: number}>
}