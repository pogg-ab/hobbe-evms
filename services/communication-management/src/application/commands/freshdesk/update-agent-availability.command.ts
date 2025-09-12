export class UpdateAgentAvailabilityCommand {
    constructor(
        public readonly id: number,
        public readonly available: boolean,
    ) { }
}