import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListPendingVerificationsQuery } from '../../queries/verification/list-pending-verification';
import { VerificationService } from '../../services/verification.service';

@QueryHandler(ListPendingVerificationsQuery)
export class ListPendingVerificationsHandler implements IQueryHandler<ListPendingVerificationsQuery> {
  constructor(private readonly service: VerificationService) {}

  async execute(query: ListPendingVerificationsQuery) {
    return this.service.findPendingVerifications();
  }
}
