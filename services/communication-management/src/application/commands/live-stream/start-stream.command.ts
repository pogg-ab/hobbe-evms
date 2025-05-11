export class StartStreamCommand {
    constructor(
        public readonly streamId: string,
        public readonly source: string | { filePath?: string; cameraDevice?: string }
    ) { }
}
