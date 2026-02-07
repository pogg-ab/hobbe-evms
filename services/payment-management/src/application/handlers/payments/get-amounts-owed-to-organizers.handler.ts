// queries/handlers/get-monthly-and-today-transactions.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAmountsOwedToOrganizersQuery } from 'src/application/queries/payments/get-amounts-owed-to-organizers.query';
import { GetMonthlyAndTodayTransactionsQuery } from 'src/application/queries/payments/get-monthly-and-today-transactions.query';
import { GetPaymentsQuery } from 'src/application/queries/payments/get-payments.query';
import { PaymentsService } from 'src/application/services/payments/payments.service';
import { Payments } from 'src/domain/entities/payments.entity';


@QueryHandler(GetAmountsOwedToOrganizersQuery)
export class GetAmountsOwedToOrganizersQueryHandler
  implements IQueryHandler<GetAmountsOwedToOrganizersQuery>
{
  constructor(private readonly paymentsService: PaymentsService) {}

  async execute(query:GetAmountsOwedToOrganizersQuery): Promise<any> {
    const {userId} = query;
    return this.paymentsService.getAmountsOwedToOrganizersQuery(userId);
  }
}
