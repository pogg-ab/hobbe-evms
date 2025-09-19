
import { CreatePaymentDto } from "src/presentation/dtos/payments/create-payments.dto";
import { Payments } from "src/domain/entities/payments.entity";
import { TransactionsVolumeByDateRangeDto } from "src/presentation/dtos/reports/trasaction-volume.dto";




export interface IPaymentsRepository{
    create(createPaymentDto: CreatePaymentDto): Promise<Payments>;
    verifyChapaPayment(payment_method:string,tx_ref:string,ex_ref:string,charge:string):Promise<any>;
    findByExRef(tx_ref:string):Promise<Payments | null>;
    changePaymentStatus(id:string,status:string):Promise<Payments | null>;
    // findByEvent(event:any):Promise<BankAccounts[] | null>
    // update(id:string,bank_account: BankAccounts): Promise<BankAccounts>
    // delete(id:string): Promise<void>

    getCurrentMonthTransactions(): Promise<any>;
    getLastMonthTransactions(): Promise<any>;
    getTodayTransactions(): Promise<any>;
    getYesterdayTransactions(): Promise<any>;

    getTransactionVolumeByDateRange(query: TransactionsVolumeByDateRangeDto): Promise<any>;
    getAggregatedTransactionVolume(aggregatedTransactionVolumeDto: any): Promise<any>;
}