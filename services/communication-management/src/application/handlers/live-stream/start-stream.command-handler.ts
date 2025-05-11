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
        const { streamId, source } = command;

        // if (typeof source === 'string') {
        //     const result = await this.streamService.startStream(streamId, source);
        //     if (!result.success) {
        //         throw new BadRequestException(result.message);
        //     }
        //     return result;
        // }

        // if (source.filePath || source.cameraDevice) {
        //     const result = await this.streamService.startStream(streamId, source);
        //     if (!result.success) {
        //         throw new BadRequestException(result.message);
        //     }
        //     return result;
        // }

        throw new BadRequestException('Invalid source provided. Must be either filePath or cameraDevice.');
    }
}