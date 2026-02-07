
import { ICommandHandler,CommandHandler } from "@nestjs/cqrs";
import { CancelTicketGiftsCommand } from "src/application/commands/ticket-gifts/cancel-ticket-gifts.command";
import { TicketsGiftServices } from "src/application/services/tickets-gift/tickets-gift.services";

@CommandHandler(CancelTicketGiftsCommand)
export class CancelTicketGiftsCommandHandler implements ICommandHandler<CancelTicketGiftsCommand> {
    constructor(
        private readonly ticketsGiftsServices: TicketsGiftServices,
    ){}
    async execute(command: CancelTicketGiftsCommand): Promise<any> {
        return this.ticketsGiftsServices.cancelTicketGift(command.giftId, command.userId, command.newReceipantId);
    }
}