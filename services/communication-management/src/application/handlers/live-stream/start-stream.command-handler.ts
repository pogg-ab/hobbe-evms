import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartStreamCommand } from 'src/application/commands/live-stream/start-stream.command';
import { StreamService } from 'src/application/services/live-stream/stream.service';
import { Stream } from 'src/domain/entities/stream.entity';

@CommandHandler(StartStreamCommand)
export class StartStreamCommandHandler
    implements ICommandHandler<StartStreamCommand> {
    constructor(private readonly streamService: StreamService) { }

    async execute(command: StartStreamCommand): Promise<{ success: boolean; message: string; data: Stream | null }> {
        const { streamId, filePath } = command;

        const result = await this.streamService.startStream(streamId, filePath);

        if (!result.success) {
            throw new BadRequestException(result.message);
        }

        return result;
    }
}