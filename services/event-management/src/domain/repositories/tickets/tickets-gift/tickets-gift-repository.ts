

interface ITicketsGiftRepository {
    findAllSentGifts(userId: string): Promise<any>;
    findAllReceivedGifts(userId: string): Promise<any>;
    cancelTicketGift(giftId: string, userId: string,newReceipantId?:string): Promise<any>;
}  