import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SpecialGuestCommand } from 'src/application/commands/special-guest/special-guest.command';
import { SpecialGuestService } from 'src/application/services/special-guest/special-guest.service';
import { SpecialGuest } from 'src/domain/entities/special-guest.entity';

@CommandHandler(SpecialGuestCommand)
export class SpecialGuestCommandHandler
  implements ICommandHandler<SpecialGuestCommand> {
  constructor(private readonly specialGuestService: SpecialGuestService) { }

  async execute(command: SpecialGuestCommand): Promise<SpecialGuest> {
    const { createSpecialGuestDto, user } = command;
    return this.specialGuestService.create(createSpecialGuestDto, user);
  }
}
