import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StopStreamCommand } from 'src/application/commands/live-stream/stop-stream.command';
import { StreamService } from 'src/application/services/live-stream/stream.service';

@CommandHandler(StopStreamCommand)
export class StopStreamCommandHandler
    implements ICommandHandler<StopStreamCommand> {
    constructor(private readonly streamService: StreamService) { }

    async execute(command: StopStreamCommand) {
        const { streamId } = command;

        return this.streamService.stopStream(streamId);
    }
}