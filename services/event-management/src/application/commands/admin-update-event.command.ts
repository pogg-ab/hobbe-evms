import { AdminUpdateEventsDto } from 'src/presentation/dtos/events/admin-update-events.dto';

export class AdminUpdateEventCommand {
  constructor(
    public readonly eventId: string,
    public readonly adminUpdateEventsDto: AdminUpdateEventsDto,
    public readonly adminId: string,
  ) {}
}
