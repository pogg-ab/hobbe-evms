import { CreateBankAccountDto } from "src/presentation/dtos/bank-accounts/create-bank-acounts.dto";
import { BankAccounts } from "../../entities/bank_accounts.entity";




export interface IBankAccountRepository{
    create(user:any, event:string, createBankAccountDto: CreateBankAccountDto): Promise<BankAccounts>;
    // create(createBankAccountDto: CreateBankAccountDto): Promise<BankAccounts>;
    // findAll( page:number, limit:number):Promise<{events:Events[]| null,total: number; page: number; limit: number}>
    findOne(id:string):Promise<BankAccounts | null>
    findByEvent(event:any):Promise<BankAccounts[] | null>
    // findByLocation(location:string):Promise<Events[]>
    // update(id:string,event: Events,user: any): Promise<Events>
    // delete(id:string): Promise<void>

    // // searching for events
    // search(keyword:string,page:number,limit:number):Promise<{events:Events[] | null,total:number, page: number; limit: number}>
}