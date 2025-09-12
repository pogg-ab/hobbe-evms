export class CreateAgentCommand {
    constructor(
        public readonly name: string,
        public readonly email: string,
        public readonly role: string,
        public readonly available: boolean,
    ) { }
}