import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlockGuestCommand } from 'src/application/commands/guest/block-guest.command';
import { GuestsService } from 'src/application/services/guests/guests.service';
import { BlockedGuest } from 'src/domain/entities/blocked-guest.entity';

@CommandHandler(BlockGuestCommand)
export class BlockGuestCommandHandler
  implements ICommandHandler<BlockGuestCommand>
{
  constructor(private readonly guestService: GuestsService) {}

  async execute(command: BlockGuestCommand): Promise<BlockedGuest> {
    const { ticketId, organizerId, eventId, reason } = command;

    return this.guestService.blockGuest(ticketId, organizerId, eventId, reason);
  }
}
