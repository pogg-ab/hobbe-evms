import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteEventSponsorCommand } from 'src/application/commands/event-sponsor/delete-event-sponsor.command';
import { EventSponsorService } from 'src/application/services/event-sponsor/event-sponsor.service';

@CommandHandler(DeleteEventSponsorCommand)
export class DeleteEventSponsorCommandHandler
  implements ICommandHandler<DeleteEventSponsorCommand>
{
  constructor(private readonly eventSponsorService: EventSponsorService) {}

  async execute(command: DeleteEventSponsorCommand): Promise<any> {
    const { id } = command;
    return this.eventSponsorService.delete(id);
  }
}
