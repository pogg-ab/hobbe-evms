import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartStreamCommand } from 'src/application/commands/live-stream/start-stream.command';
import { StreamService } from 'src/application/services/live-stream/stream.service';

@CommandHandler(StartStreamCommand)
export class StartStreamCommandHandler
    implements ICommandHandler<StartStreamCommand> {
    constructor(private readonly streamService: StreamService) { }

    async execute(command: StartStreamCommand): Promise<void> {
        const { streamId, filePath } = command;
        await this.streamService.startStream(streamId, filePath);
    }
}