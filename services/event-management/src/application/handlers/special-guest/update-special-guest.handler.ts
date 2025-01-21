import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatedSpecialGuestCommand } from 'src/application/commands/special-guest/update-special-guest.command';
import { SpecialGuestService } from 'src/application/services/special-guest/special-guest.service';
import { SpecialGuest } from 'src/domain/entities/special-guest.entity';

@CommandHandler(UpdatedSpecialGuestCommand)
export class UpdatedSpecialGuestCommandHandler
  implements ICommandHandler<UpdatedSpecialGuestCommand>
{
  constructor(private readonly specialGuestService: SpecialGuestService) {}

  async execute(command: UpdatedSpecialGuestCommand): Promise<SpecialGuest> {
    const { id, createSpecialGuestDto } = command;
    return this.specialGuestService.update(id, createSpecialGuestDto);
  }
}
