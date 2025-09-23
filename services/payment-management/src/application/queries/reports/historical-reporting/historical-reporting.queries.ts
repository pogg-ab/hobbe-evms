import { DailyMonthlyRevenueReportDto } from 'src/presentation/dtos/reports/historical-reporting.dtos';
import { RefundReportDto } from 'src/presentation/dtos/reports/historical-reporting.dtos';
import { PaymentMethodReportDto } from 'src/presentation/dtos/reports/historical-reporting.dtos';

export class GetDailyMonthlyRevenueReportQuery {
    constructor(
        public readonly filters: DailyMonthlyRevenueReportDto,
        public readonly page: number,
        public readonly limit: number,
    ) { }
}

export class GetRefundReportQuery {
    constructor(
        public readonly filters: RefundReportDto,
        public readonly page: number,
        public readonly limit: number,
    ) { }
}

export class GetPaymentMethodReportQuery {
    constructor(
        public readonly filters: PaymentMethodReportDto,
        public readonly page: number,
        public readonly limit: number,
    ) { }
}
