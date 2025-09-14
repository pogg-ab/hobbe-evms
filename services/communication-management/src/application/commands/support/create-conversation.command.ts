export class CreateConversationCommand {
    constructor(
        public readonly ticketId: number,
        public readonly body: string,
        public readonly fromEmail: string,
        public readonly userId?: number,
        public readonly isPrivate?: boolean,
    ) { }
}

