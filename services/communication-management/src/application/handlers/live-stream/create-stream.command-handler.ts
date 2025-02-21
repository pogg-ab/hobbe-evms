import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateStreamCommand } from 'src/application/commands/live-stream/create-stream.command';
import { StreamService } from 'src/application/services/live-stream/stream.service';
import { StreamID } from 'src/domain/value-objects/stream-id.value-object';

@CommandHandler(CreateStreamCommand)
export class CreateStreamHandler
  implements ICommandHandler<CreateStreamCommand> {
  constructor(private readonly streamService: StreamService) { }

  async execute(command: CreateStreamCommand): Promise<any> {
    const { userId, eventId } = command;

    const streamID = new StreamID();
    return this.streamService.createStream(streamID, userId, eventId);
  }
}
