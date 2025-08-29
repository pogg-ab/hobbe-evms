import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventsService } from 'src/application/services/events/events.service';
import {
  ApproveEventCommand,
  CancelEventCommand,
  RejectEventCommand,
  RequestEventChangesCommand,
  SetEventPendingCommand,
} from 'src/application/commands/event-status.commands';
import { Events } from 'src/domain/entities/events.entity';

@CommandHandler(ApproveEventCommand)
export class ApproveEventCommandHandler
  implements ICommandHandler<ApproveEventCommand>
{
  constructor(private readonly eventsService: EventsService) {}

  async execute(command: ApproveEventCommand): Promise<Events> {
    return await this.eventsService.approveEvent(
      command.eventId,
      command.feedback,
      command.adminId,
    );
  }
}

@CommandHandler(RejectEventCommand)
export class RejectEventCommandHandler
  implements ICommandHandler<RejectEventCommand>
{
  constructor(private readonly eventsService: EventsService) {}

  async execute(command: RejectEventCommand): Promise<Events> {
    return await this.eventsService.rejectEvent(
      command.eventId,
      command.feedback,
      command.adminId,
    );
  }
}

@CommandHandler(RequestEventChangesCommand)
export class RequestEventChangesCommandHandler
  implements ICommandHandler<RequestEventChangesCommand>
{
  constructor(private readonly eventsService: EventsService) {}

  async execute(command: RequestEventChangesCommand): Promise<Events> {
    return await this.eventsService.requestEventChanges(
      command.eventId,
      command.feedback,
      command.adminId,
    );
  }
}

@CommandHandler(SetEventPendingCommand)
export class SetEventPendingCommandHandler
  implements ICommandHandler<SetEventPendingCommand>
{
  constructor(private readonly eventsService: EventsService) {}

  async execute(command: SetEventPendingCommand): Promise<Events> {
    return await this.eventsService.setEventPending(
      command.eventId,
      command.feedback,
      command.userId,
    );
  }
}

@CommandHandler(CancelEventCommand)
export class CancelEventCommandHandler
  implements ICommandHandler<CancelEventCommand>
{
  constructor(private readonly eventsService: EventsService) {}

  async execute(command: CancelEventCommand): Promise<Events> {
    return await this.eventsService.cancelEvent(
      command.eventId,
      command.feedback,
      command.userId,
    );
  }
}
