
// create query for View all payments linked to events (ticket purchases, refunds, payouts)

import { IQuery } from '@nestjs/cqrs';
import { GetPaymentsDto } from 'src/presentation/dtos/payments/get-payments.dto';

export class GetAmountsOwedToOrganizersQuery implements IQuery {
    constructor(
        public readonly userId:string,
    ) {}
}