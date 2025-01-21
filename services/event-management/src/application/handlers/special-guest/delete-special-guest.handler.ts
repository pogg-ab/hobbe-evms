import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteSpecialGuestCommand } from 'src/application/commands/special-guest/delete-special-guest.command';
import { SpecialGuestService } from 'src/application/services/special-guest/special-guest.service';

@CommandHandler(DeleteSpecialGuestCommand)
export class DeleteSpecialGuestCommandHandler
  implements ICommandHandler<DeleteSpecialGuestCommand>
{
  constructor(private readonly specialGuestService: SpecialGuestService) {}

  async execute(command: DeleteSpecialGuestCommand): Promise<any> {
    const { id } = command;
    return this.specialGuestService.delete(id);
  }
}
