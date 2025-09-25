
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllSentGiftsQuery } from "src/application/queries/tickets-gift/get-sent-gift-tickets.query";
import { TicketsGiftServices } from "src/application/services/tickets-gift/tickets-gift.services";

@QueryHandler(GetAllSentGiftsQuery)
export class GetSentTicketsGiftHandler implements IQueryHandler<GetAllSentGiftsQuery> {
    constructor(
        private readonly ticketsGiftsServices: TicketsGiftServices,
    ){}
    async execute(query: GetAllSentGiftsQuery): Promise<any> {
        return this.ticketsGiftsServices.findAllSentGifts(query.userId);
    }
}