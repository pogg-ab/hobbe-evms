import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommissionFeeService } from 'src/application/services/commission-fee/commission-fee.service';
import { GetCommissionFeeByIdQuery } from 'src/application/queries/commission-fee/get-commission-fee-by-id.query';
import { CommissionFee } from 'src/domain/entities/commission-fee.entity';

@QueryHandler(GetCommissionFeeByIdQuery)
export class GetCommissionFeeByIdQueryHandler implements IQueryHandler<GetCommissionFeeByIdQuery> {
    constructor(private readonly commissionFeeService: CommissionFeeService) { }

    async execute(query: GetCommissionFeeByIdQuery): Promise<CommissionFee> {
        return await this.commissionFeeService.getCommissionFeeById(query.commissionFeeId);
    }
}