import { ICommand } from '@nestjs/cqrs';
import { CreateEventSponsorDto } from 'src/presentation/dtos/event-sponsor/create-event-sponsor.dto';

export class EventSponsorCommand implements ICommand {
  constructor(public readonly createEventSponsorDto: CreateEventSponsorDto) {}
}
