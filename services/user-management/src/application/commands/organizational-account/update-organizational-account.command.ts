import { ICommand } from '@nestjs/cqrs';
import { UpdateOrganizationalAccountDto } from 'src/presentation/dtos/update-organizational-account.dto';

export class UpdateOrganizationalAccountCommand implements ICommand {
  constructor(
    public readonly id: number,
    public readonly updateOrganizationalAccountDto: UpdateOrganizationalAccountDto,
  ) {}
}
