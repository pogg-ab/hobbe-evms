import { ICommand } from '@nestjs/cqrs';
import { Promocodes } from 'src/domain/entities/promocodes.entity';

export class UpdatePromocodeCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly promocode: Promocodes,
  ) {}
}
