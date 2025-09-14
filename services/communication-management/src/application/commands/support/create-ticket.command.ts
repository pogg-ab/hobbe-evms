export class CreateTicketCommand {
    constructor(
        public readonly subject: string,
        public readonly description: string,
        public readonly email: string,
        public readonly priority: number,
        public readonly status: number,
    ) { }
}