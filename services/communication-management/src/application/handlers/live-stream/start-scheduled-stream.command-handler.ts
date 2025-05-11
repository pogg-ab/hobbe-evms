import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartScheduledStreamCommand } from 'src/application/commands/live-stream/start-scheduled-stream.command';
import { StreamService } from 'src/application/services/live-stream/stream.service';

@CommandHandler(StartScheduledStreamCommand)
export class StartScheduledStreamHandler implements ICommandHandler<StartScheduledStreamCommand> {
    constructor(private readonly streamService: StreamService) { }

    async execute(command: StartScheduledStreamCommand): Promise<any> {
        const {
            userId,
            streamId, startStreamDto,
        } = command;

        return this.streamService.startScheduledStream(
            userId,
            streamId,
            startStreamDto
        );
    }
}