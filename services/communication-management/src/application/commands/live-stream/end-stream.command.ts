export class EndStreamCommand {
    constructor(
        public readonly userId: string,
        public readonly streamId: string,
    ) { }
}