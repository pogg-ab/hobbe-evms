import { ICommand } from '@nestjs/cqrs';
import { CreateSpecialGuestDto } from 'src/presentation/dtos/special-guest/create-special-guest.dto';

export class UpdatedSpecialGuestCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly createSpecialGuestDto: CreateSpecialGuestDto,
  ) {}
}
