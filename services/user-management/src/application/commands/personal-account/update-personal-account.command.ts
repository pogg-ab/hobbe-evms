import { ICommand } from '@nestjs/cqrs';
import { UpdatePersonalAccountDto } from 'src/presentation/dtos/update-personal-account.dto';

export class UpdatePersonalAccountCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly updatePersonalAccountDto: UpdatePersonalAccountDto,
  ) {}
}
