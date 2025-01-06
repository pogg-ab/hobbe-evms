import { ICommand } from '@nestjs/cqrs';
import { CreateEventSponsorDto } from 'src/presentation/dtos/event-sponsor/create-event-sponsor.dto';

export class UpdatedEventSponsorCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly createEventSponsorDto: CreateEventSponsorDto,
  ) {}
}
