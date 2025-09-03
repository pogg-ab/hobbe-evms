// query handler for aggregated transaction volume by day, week, month, year
import { HttpException, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AggregatedTransactionVolumeQuery } from 'src/application/queries/payments/aggregated-transaction-volume.query';
import { PaymentsService } from 'src/application/services/payments/payments.service';
@QueryHandler(AggregatedTransactionVolumeQuery)
@Injectable()
export class AggregatedTransactionVolumeQueryHandler implements IQueryHandler<AggregatedTransactionVolumeQuery> {
  constructor(private readonly paymentsService: PaymentsService) {}

  async execute(query: AggregatedTransactionVolumeQuery): Promise<any> {
    
    if (!query.aggregatedTransactionVolumeDto || !query.aggregatedTransactionVolumeDto.startDate || !query.aggregatedTransactionVolumeDto.endDate) {
      throw new HttpException('Start date and end date are required', 400);
    }
    return this.paymentsService.getAggregatedTransactionVolume(query.aggregatedTransactionVolumeDto);
  }
}