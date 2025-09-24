// queries/handlers/get-monthly-and-today-transactions.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMonthlyAndTodayTransactionsQuery } from 'src/application/queries/payments/get-monthly-and-today-transactions.query';
import { GetPaymentsQuery } from 'src/application/queries/payments/get-payments.query';
import { PaymentsService } from 'src/application/services/payments/payments.service';
import { Payments } from 'src/domain/entities/payments.entity';


@QueryHandler(GetPaymentsQuery)
export class GetPaymentsQueryHandler
  implements IQueryHandler<GetPaymentsQuery>
{
  constructor(private readonly paymentsService: PaymentsService) {}

  async execute(query?: GetPaymentsQuery): Promise<Payments[]> {
    const {dto} = query;
    return this.paymentsService.getPayments(dto);
  }
}
