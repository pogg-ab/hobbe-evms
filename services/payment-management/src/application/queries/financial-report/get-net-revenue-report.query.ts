import { CustomReportFilterDto } from "src/presentation/dtos/financial-report/custom-report-filter.dto";

export class GetNetRevenueReportQuery {
    constructor(
        public readonly filters: CustomReportFilterDto,
        public readonly page: number,
        public readonly limit: number,
    ) { }
}