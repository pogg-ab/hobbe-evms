export class GetAgentTimeReportQuery {
    constructor(
        public readonly agentId: number,
        public readonly startDate: Date,
        public readonly endDate: Date,
    ) { }
}