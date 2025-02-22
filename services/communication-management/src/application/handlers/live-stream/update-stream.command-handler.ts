import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateStreamCommand } from 'src/application/commands/live-stream/update-stream.command';
import { StreamService } from 'src/application/services/live-stream/stream.service';

@CommandHandler(UpdateStreamCommand)
export class UpdateStreamHandler
  implements ICommandHandler<UpdateStreamCommand>
{
  constructor(private readonly streamService: StreamService) {}

  async execute(command: UpdateStreamCommand): Promise<any> {
    const { streamId, url, status } = command;
    return this.streamService.updateStream(streamId, url, status);
  }
}
