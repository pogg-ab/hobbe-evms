import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ScheduleStreamCommand } from 'src/application/commands/live-stream/schedule-stream.command';
import { StreamService } from 'src/application/services/live-stream/stream.service';
import { StreamID } from 'src/domain/value-objects/stream-id.value-object';

@CommandHandler(ScheduleStreamCommand)
export class ScheduleStreamHandler implements ICommandHandler<ScheduleStreamCommand> {
    constructor(private readonly streamService: StreamService) { }

    async execute(command: ScheduleStreamCommand): Promise<any> {
        const {
            userId,
            eventId,
        } = command;

        return this.streamService.scheduleStream(
            userId,
            eventId,
        );
    }
}