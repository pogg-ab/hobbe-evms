import { TransactionsVolumeByDateRangeDto } from "src/presentation/dtos/reports/trasaction-volume.dto";

export class TransactionsVolumeByDateRange {
    constructor(
        public readonly daterange:TransactionsVolumeByDateRangeDto
    ) {}
}
