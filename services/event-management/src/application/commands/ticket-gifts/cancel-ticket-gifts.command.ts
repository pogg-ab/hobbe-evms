import { ICommand } from "@nestjs/cqrs";


export class CancelTicketGiftsCommand implements ICommand {
    constructor(
        public readonly giftId: string,
        public readonly userId: string,
        public readonly newReceipantId?:string,
    ) {}
}