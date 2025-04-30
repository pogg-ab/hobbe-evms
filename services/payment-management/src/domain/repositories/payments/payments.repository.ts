
import { CreatePaymentDto } from "src/presentation/dtos/payments/create-payments.dto";
import { Payments } from "src/domain/entities/payments.entity";




export interface IPaymentsRepository{
    create(createPaymentDto: CreatePaymentDto): Promise<Payments>;
    verifyChapaPayment(tx_ref:string,charge:string):Promise<any>;
    // findByEvent(event:any):Promise<BankAccounts[] | null>
    // update(id:string,bank_account: BankAccounts): Promise<BankAccounts>
    // delete(id:string): Promise<void>

    getCurrentMonthTransactions(): Promise<any>;
    getLastMonthTransactions(): Promise<any>;
    getTodayTransactions(): Promise<any>;
    getYesterdayTransactions(): Promise<any>;
}