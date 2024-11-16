import { ICommand } from '@nestjs/cqrs';
import { OrganizationalAccountID } from 'src/domain/value-objects/organizational-account-id.value-object';
import { UpdateOrganizationalAccountDto } from 'src/presentation/dtos/update-organizational-account.dto';

export class UpdateOrganizationalAccountCommand implements ICommand {
  constructor(
    public readonly id: OrganizationalAccountID,
    public readonly updateOrganizationalAccountDto: UpdateOrganizationalAccountDto,
  ) {}
}
