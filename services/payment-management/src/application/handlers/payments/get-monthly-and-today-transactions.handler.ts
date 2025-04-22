// queries/handlers/get-monthly-and-today-transactions.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMonthlyAndTodayTransactionsQuery } from 'src/application/queries/payments/get-monthly-and-today-transactions.query';
import { PaymentsService } from 'src/application/services/payments/payments.service';


@QueryHandler(GetMonthlyAndTodayTransactionsQuery)
export class GetMonthlyAndTodayTransactionsHandler
  implements IQueryHandler<GetMonthlyAndTodayTransactionsQuery>
{
  constructor(private readonly paymentsService: PaymentsService) {}

  async execute(): Promise<any> {
    return this.paymentsService.getMonthlyAndTodaySummary();
  }
}
