import { StartStreamDto } from "src/presentation/dto/live-stream/start-stream.dto";

export class StartScheduledStreamCommand {
    constructor(
        public readonly userId: string,
        public readonly streamId: string,
        public readonly startStreamDto: StartStreamDto
    ) { }
}