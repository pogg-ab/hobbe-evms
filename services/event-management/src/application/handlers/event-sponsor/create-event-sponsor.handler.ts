import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventSponsorCommand } from 'src/application/commands/event-sponsor/event-sponsor.command';
import { EventSponsorService } from 'src/application/services/event-sponsor/event-sponsor.service';
import { EventSponsor } from 'src/domain/entities/event-sponsor.entity';

@CommandHandler(EventSponsorCommand)
export class EventSponsorCommandHandler
  implements ICommandHandler<EventSponsorCommand> {
  constructor(private readonly eventSponsorService: EventSponsorService) { }

  async execute(command: EventSponsorCommand): Promise<EventSponsor> {
    const { createEventSponsorDto, user } = command;
    return this.eventSponsorService.create(createEventSponsorDto, user);
  }
}
