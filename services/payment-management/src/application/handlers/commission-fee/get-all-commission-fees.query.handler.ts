import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommissionFeeService } from 'src/application/services/commission-fee/commission-fee.service';
import { GetAllCommissionFeesQuery } from 'src/application/queries/commission-fee/get-all-commission-fees.query';
import { CommissionFee } from 'src/domain/entities/commission-fee.entity';

@QueryHandler(GetAllCommissionFeesQuery)
export class GetAllCommissionFeesQueryHandler implements IQueryHandler<GetAllCommissionFeesQuery> {
    constructor(private readonly commissionFeeService: CommissionFeeService) { }

    async execute(query: GetAllCommissionFeesQuery): Promise<{ commissionFees: CommissionFee[] | null; total: number; page: number; limit: number; totalPages: number }> {
        return await this.commissionFeeService.getAllCommissionFees(query.page, query.limit);
    }
}