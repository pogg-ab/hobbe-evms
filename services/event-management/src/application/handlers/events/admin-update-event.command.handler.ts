import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventsService } from 'src/application/services/events/events.service';
import { AdminUpdateEventCommand } from 'src/application/commands/admin-update-event.command';
import { Events } from 'src/domain/entities/events.entity';

@CommandHandler(AdminUpdateEventCommand)
export class AdminUpdateEventCommandHandler
  implements ICommandHandler<AdminUpdateEventCommand>
{
  constructor(private readonly eventsService: EventsService) {}

  async execute(command: AdminUpdateEventCommand): Promise<Events> {
    return await this.eventsService.adminUpdateEvent(
      command.eventId,
      command.adminUpdateEventsDto,
      command.adminId,
    );
  }
}
