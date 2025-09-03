// As an admin, I want to see the total volume of transactions on Hobbe platform over selectable time ranges. 

// query handler for transaction volume by date range
import { HttpException, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TransactionsVolumeByDateRange } from 'src/application/queries/payments/transaction-volume-by-date-range.query';
import { PaymentsService } from 'src/application/services/payments/payments.service';
@QueryHandler(TransactionsVolumeByDateRange)
@Injectable()
export class TransactionsVolumeByDateRangeHandler implements IQueryHandler<TransactionsVolumeByDateRange> {
  constructor(private readonly paymentsService: PaymentsService) {}

  async execute(query: TransactionsVolumeByDateRange): Promise<any> {
    if (!query.daterange || !query.daterange.startDate || !query.daterange.endDate) {
      throw new HttpException('Start date and end date are required', 400);
    }
    return this.paymentsService.getTransactionVolumeByDateRange(query.daterange);
  }
}