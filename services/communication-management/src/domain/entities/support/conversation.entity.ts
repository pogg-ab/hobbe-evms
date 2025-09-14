export class Conversation {
    constructor(
        public readonly id: number,
        public readonly ticketId: number,
        public readonly body: string,
        public readonly fromEmail: string,
        public readonly userId: number,
        public readonly userName: string,
        public readonly isPrivate: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }
}