export class UnblockGuestCommand {
    constructor(
        public readonly ticketId: string,
        public readonly organizerId: string,
        public readonly eventId: string,
    ) { }
}
