export class UpdateTimeEntryCommand {
    constructor(
        public readonly id: number,
        public readonly note?: string,
        public readonly timeSpent?: string,
        public readonly billable?: boolean,
        public readonly executedAt?: Date,
    ) { }
}