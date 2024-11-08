import { ICommand } from '@nestjs/cqrs';
import { CreateOrganizationalAccountDto } from 'src/presentation/dtos/create-organizational-account.dto';

export class CreateOrganizationalAccountCommand implements ICommand {
  constructor(
    public readonly createOrganizationalAccountDto: CreateOrganizationalAccountDto,
  ) {}
}
