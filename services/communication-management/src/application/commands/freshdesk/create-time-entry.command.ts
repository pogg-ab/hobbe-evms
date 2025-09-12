export class CreateTimeEntryCommand {
    constructor(
        public readonly ticketId: number,
        public readonly agentId: number,
        public readonly note: string,
        public readonly timeSpent: string,
        public readonly executedAt: Date,
    ) { }
}