import { ICommand } from '@nestjs/cqrs';
import { CreatePersonalAccountDto } from 'src/presentation/dtos/create-personal-account.dto';

export class CreatePersonalAccountCommand implements ICommand {
  constructor(
    public readonly createPersonalAccountDto: CreatePersonalAccountDto,
  ) {}
}
