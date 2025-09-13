
import { Payouts } from "src/domain/entities/payouts.entity";
import { CreatePayoutDto } from "src/presentation/dtos/payments/create-payouts.dto";
import { TransactionsVolumeByDateRangeDto } from "src/presentation/dtos/reports/trasaction-volume.dto";




export interface IPayoutsRepository{
    create(createPayoutDto: CreatePayoutDto): Promise<Payouts>;
    verifyChapaPayout(payment_method:string,tx_ref:string,charge:string):Promise<any>;
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