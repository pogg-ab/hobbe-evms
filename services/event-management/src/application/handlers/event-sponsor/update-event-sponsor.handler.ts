import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatedEventSponsorCommand } from 'src/application/commands/event-sponsor/update-event-sponsor.command';
import { EventSponsorService } from 'src/application/services/event-sponsor/event-sponsor.service';
import { EventSponsor } from 'src/domain/entities/event-sponsor.entity';

@CommandHandler(UpdatedEventSponsorCommand)
export class UpdatedEventSponsorCommandHandler
  implements ICommandHandler<UpdatedEventSponsorCommand>
{
  constructor(private readonly eventSponsorService: EventSponsorService) {}

  async execute(command: UpdatedEventSponsorCommand): Promise<EventSponsor> {
    const { id, createEventSponsorDto } = command;
    return this.eventSponsorService.update(id, createEventSponsorDto);
  }
}
