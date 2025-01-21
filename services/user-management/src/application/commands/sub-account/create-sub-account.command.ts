import { ICommand } from '@nestjs/cqrs';
import { CreateSubAccountDto } from 'src/presentation/dtos/create-sub-account.dto';

export class CreateSubAccountCommand implements ICommand {
  constructor(public readonly createSubAccountDto: CreateSubAccountDto) {}
}
