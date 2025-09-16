export class UpdateAgentCommand {
    constructor(
        public readonly id: number,
        public readonly name?: string,
        public readonly email?: string,
        public readonly role?: string,
        public readonly available?: boolean,
    ) { }
}