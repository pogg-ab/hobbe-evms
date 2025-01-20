import { ICommand } from '@nestjs/cqrs';
import { CreateSpecialGuestDto } from 'src/presentation/dtos/special-guest/create-special-guest.dto';

export class SpecialGuestCommand implements ICommand {
  constructor(public readonly createSpecialGuestDto: CreateSpecialGuestDto, public readonly user: any) { }
}
