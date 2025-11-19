import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnblockGuestCommand } from 'src/application/commands/guest/unblock-guest.command';
import { GuestsService } from 'src/application/services/guests/guests.service';
import { BlockedGuest } from 'src/domain/entities/blocked-guest.entity';

@CommandHandler(UnblockGuestCommand)
export class UnblockGuestCommandHandler
    implements ICommandHandler<UnblockGuestCommand> {
    constructor(private readonly guestService: GuestsService) { }

    async execute(command: UnblockGuestCommand): Promise<BlockedGuest | null> {
        const { ticketId, organizerId, eventId } = command;

        return this.guestService.unblockGuest(ticketId, organizerId, eventId);
    }
}