
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllReceivedGiftsQuery } from "src/application/queries/tickets-gift/get-received-gift-tickets.query";
import { TicketsGiftServices } from "src/application/services/tickets-gift/tickets-gift.services";

@QueryHandler(GetAllReceivedGiftsQuery)
export class GetReceivedTicketsGiftHandler implements IQueryHandler<GetAllReceivedGiftsQuery> {
    constructor(
        private readonly ticketsGiftsServices: TicketsGiftServices,
    ){}
    async execute(query: GetAllReceivedGiftsQuery): Promise<any> {
        return this.ticketsGiftsServices.findAllReceivedGifts(query.userId);
    }
}