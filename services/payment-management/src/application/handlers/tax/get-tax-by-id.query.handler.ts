import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TaxService } from 'src/application/services/tax/tax.service';
import { GetTaxByIdQuery } from 'src/application/queries/tax/get-tax-by-id.query';
import { Tax } from 'src/domain/entities/tax.entity';

@QueryHandler(GetTaxByIdQuery)
export class GetTaxByIdQueryHandler implements IQueryHandler<GetTaxByIdQuery> {
    constructor(private readonly taxService: TaxService) { }

    async execute(query: GetTaxByIdQuery): Promise<Tax> {
        return await this.taxService.getTaxById(query.taxId);
    }
}