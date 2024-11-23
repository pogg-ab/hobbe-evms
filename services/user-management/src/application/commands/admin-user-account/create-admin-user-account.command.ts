import { ICommand } from '@nestjs/cqrs';
import { CreateAdminUserAccountDto } from 'src/presentation/dtos/create-admin-user-account.dto';

export class CreateAdminUserAccountCommand implements ICommand {
  constructor(
    public readonly createAdminUserAccountDto: CreateAdminUserAccountDto,
  ) {}
}
