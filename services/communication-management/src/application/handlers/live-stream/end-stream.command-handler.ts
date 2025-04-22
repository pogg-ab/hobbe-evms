// src/application/handlers/live-stream/end-stream.command-handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EndStreamCommand } from 'src/application/commands/live-stream/end-stream.command';
import { StreamService } from 'src/application/services/live-stream/stream.service';

@CommandHandler(EndStreamCommand)
export class EndStreamHandler implements ICommandHandler<EndStreamCommand> {
    constructor(private readonly streamService: StreamService) { }

    async execute(command: EndStreamCommand): Promise<any> {
        const { userId, streamId } = command;

        return this.streamService.endStream(
            streamId,
            userId,
        );
    }
}