// query to get total transaction value aggregated by day, week, month, year

import { AggregatedTransactionVolumeDto } from "src/presentation/dtos/reports/aggregated-transaction-volume.dto";

export class AggregatedTransactionVolumeQuery {
  constructor(
   public readonly aggregatedTransactionVolumeDto: AggregatedTransactionVolumeDto
  ) {}
}