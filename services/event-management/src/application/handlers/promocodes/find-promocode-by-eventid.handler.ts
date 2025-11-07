import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindPromocodeByEventIdQuery } from 'src/application/queries/promocodes/find-promocode-by-eventid.query';
import { PromocodeServices } from 'src/application/services/tickets/promocode/promocode.service';
import { Promocodes } from 'src/domain/entities/promocodes.entity';

@QueryHandler(FindPromocodeByEventIdQuery)
export class FindPromocodeByEventIdHandler
    implements IQueryHandler<FindPromocodeByEventIdQuery> {
    constructor(private readonly promocodeServices: PromocodeServices) { }

    async execute(query: FindPromocodeByEventIdQuery): Promise<Promocodes | null> {
        const { eventId } = query;
        return await this.promocodeServices.findByEventId(eventId);
    }
}
