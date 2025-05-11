export class ScheduleStreamCommand {
    constructor(
        public readonly userId: string,
        public readonly eventId: string,
        public readonly scheduledDate: Date,
        public readonly scheduledTime: string,
        public readonly timezone?: string,
    ) { }
}