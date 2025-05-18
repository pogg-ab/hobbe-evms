export class ScheduleStreamCommand {
    constructor(
        public readonly userId: string,
        public readonly eventId: string,
    ) { }
}