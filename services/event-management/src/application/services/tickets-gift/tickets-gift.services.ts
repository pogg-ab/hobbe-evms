import { Inject, Injectable } from "@nestjs/common";
import { TOKEN_TICKETS_GIFT_REPOSITORY } from "src/domain/repositories/tickets/tickets-gift/tickets-gift-repository.token";

@Injectable()
export class TicketsGiftServices {

    constructor(
        @Inject(TOKEN_TICKETS_GIFT_REPOSITORY)
        private readonly ticketGiftsRepository: ITicketsGiftRepository,
    ){}

    async findAllSentGifts(userId: string): Promise<any> {
        return await this.ticketGiftsRepository.findAllSentGifts(userId);
    }

    async findAllReceivedGifts(userId: string): Promise<any> {
        return await this.ticketGiftsRepository.findAllReceivedGifts(userId);
    }

    async cancelTicketGift(giftId: string, userId: string, newReceipantId?:string): Promise<any> {
        return await this.ticketGiftsRepository.cancelTicketGift(giftId, userId, newReceipantId);
    }
}