import { ICommand } from '@nestjs/cqrs';
import { PersonalAccountID } from 'src/domain/value-objects/personal-account-id.value-object';
import { UpdatePersonalAccountDto } from 'src/presentation/dtos/update-personal-account.dto';

export class UpdatePersonalAccountCommand implements ICommand {
  constructor(
    public readonly id: PersonalAccountID,
    public readonly updatePersonalAccountDto: UpdatePersonalAccountDto,
  ) {}
}
