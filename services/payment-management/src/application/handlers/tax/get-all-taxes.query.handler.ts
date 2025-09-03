import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TaxService } from 'src/application/services/tax/tax.service';
import { GetAllTaxesQuery } from 'src/application/queries/tax/get-all-taxes.query';
import { Tax } from 'src/domain/entities/tax.entity';

@QueryHandler(GetAllTaxesQuery)
export class GetAllTaxesQueryHandler implements IQueryHandler<GetAllTaxesQuery> {
    constructor(private readonly taxService: TaxService) { }

    async execute(query: GetAllTaxesQuery): Promise<{ taxes: Tax[] | null; total: number; page: number; limit: number; totalPages: number }> {
        return await this.taxService.getAllTaxes(query.page, query.limit);
    }
}