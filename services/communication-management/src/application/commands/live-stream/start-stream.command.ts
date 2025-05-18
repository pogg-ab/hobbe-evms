export class StartStreamCommand {
    constructor(
        public readonly streamId: string,
        public readonly userId: string
    ) { }
}
