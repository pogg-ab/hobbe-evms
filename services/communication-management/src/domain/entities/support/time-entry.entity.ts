export class TimeEntry {
    constructor(
        public readonly id: number,
        public readonly ticketId: number,
        public readonly agentId: number,
        public readonly note: string,
        public readonly timeSpent: string,
        public readonly executedAt: Date,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }
}