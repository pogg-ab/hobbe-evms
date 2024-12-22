import { ICommand } from '@nestjs/cqrs';
import { SubAccountID } from 'src/domain/value-objects/sub-account-id.value-object';
import { UpdateSubAccountDto } from 'src/presentation/dtos/update-sub-account.dto';

export class UpdateSubAccountCommand implements ICommand {
  constructor(
    public readonly id: SubAccountID,
    public readonly updateSubAccountDto: UpdateSubAccountDto,
  ) {}
}
