import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetVerificationStatusQuery } from 'src/application/queries/verification/get-verification-status.query';
import { VerificationService } from 'src/application/services/verification.service';
import { VerificationRequest } from 'src/domain/entities/verification-request.entity';

@QueryHandler(GetVerificationStatusQuery)
export class GetVerificationStatusQueryHandler
  implements IQueryHandler<GetVerificationStatusQuery>
{
  constructor(private readonly verificationService: VerificationService) {}

  async execute(
    query: GetVerificationStatusQuery,
  ): Promise<VerificationRequest> {
    return this.verificationService.getStatusByUserId(query.userId);
  }
}
