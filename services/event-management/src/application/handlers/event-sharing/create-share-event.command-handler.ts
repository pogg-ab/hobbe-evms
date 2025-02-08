import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateShareEventCommand } from "src/application/commands/event-sharing/create-share-event.command";
import { EventSharingService } from "src/application/services/event-sharing/event-sharing.service";
import { EventShare } from "src/domain/entities/event-share.entity";

@CommandHandler(CreateShareEventCommand)
export class CreateShareEventCommandHandler implements ICommandHandler<CreateShareEventCommand> {
  constructor(
    private readonly eventSharingService: EventSharingService
  ) {}

  execute(command: CreateShareEventCommand): Promise<EventShare> {
    const { user, shareEventDto } = command;
    return this.eventSharingService.shareEvent(user, shareEventDto);
  }
}
