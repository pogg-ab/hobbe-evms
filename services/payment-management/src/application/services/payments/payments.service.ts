import { Inject, Injectable } from '@nestjs/common';
import { TransactionsVolumeByDateRange } from 'src/application/queries/payments/transaction-volume-by-date-range.query';
import { IPaymentsRepository } from 'src/domain/repositories/payments/payments.repository';
import { CREATE_PAYMENT_TOKEN } from 'src/domain/repositories/payments/payments.repository.token';
import { CreateChapaPayDto } from 'src/presentation/dtos/chapa/create-chapa-pay.dto';
import { CreatePaymentDto } from 'src/presentation/dtos/payments/create-payments.dto';
import { AggregatedTransactionVolumeDto } from 'src/presentation/dtos/reports/aggregated-transaction-volume.dto';
import { TransactionsVolumeByDateRangeDto } from 'src/presentation/dtos/reports/trasaction-volume.dto';

@Injectable()
export class PaymentsService {
 constructor(
    @Inject(CREATE_PAYMENT_TOKEN)
    private readonly paymentRepository:IPaymentsRepository
 ){}
    async create(createPaymentDto:CreatePaymentDto){
        return this.paymentRepository.create(createPaymentDto);
    }


    async getMonthlyAndTodaySummary() {
        const [monthly, lastMonth] = await Promise.all([
          this.paymentRepository.getCurrentMonthTransactions(),
          this.paymentRepository.getLastMonthTransactions(),
        ]);
    
        const [today, yesterday] = await Promise.all([
          this.paymentRepository.getTodayTransactions(),
          this.paymentRepository.getYesterdayTransactions(),
        ]);
    
        const monthChange = this.calculateChange(
          monthly.total_value,
          lastMonth.total_value,
        );
    
        const dayChange = this.calculateChange(
          today.total_value,
          yesterday.total_value,
        );
    
        return {
          today,
          yesterday,
          today_vs_yesterday: `${dayChange}%`,
    
          current_month: monthly,
          last_month: lastMonth,
          month_vs_last_month: `${monthChange}%`,
        };
      }
    
      private calculateChange(current: number, previous: number): number {
        if (!previous || previous === 0) return current > 0 ? 100 : 0;
        return +(((current - previous) / previous) * 100).toFixed(2);
      }


    async getTransactionVolumeByDateRange(daterange: TransactionsVolumeByDateRangeDto): Promise<any> {
        if (!daterange || !daterange.startDate || !daterange.endDate) {
            throw new Error('Start date and end date are required');
        }
        return this.paymentRepository.getTransactionVolumeByDateRange(daterange);
    }


    async getAggregatedTransactionVolume(aggregatedTransactionVolumeDto:AggregatedTransactionVolumeDto): Promise<any> {
        if (!aggregatedTransactionVolumeDto || !aggregatedTransactionVolumeDto.startDate || !aggregatedTransactionVolumeDto.endDate) {
            throw new Error('Start date and end date are required');
        }
        return this.paymentRepository.getAggregatedTransactionVolume(aggregatedTransactionVolumeDto);
    }
}
