import { ICommand } from '@nestjs/cqrs';
import { AdminUserAccountID } from 'src/domain/value-objects/admin-user-account-id.value-object';
import { UpdateAdminUserAccountDto } from 'src/presentation/dtos/update-admin-user-account.dto';

export class UpdateAdminUserAccountCommand implements ICommand {
  constructor(
    public readonly id: AdminUserAccountID,
    public readonly updateAdminUserAccountDto: UpdateAdminUserAccountDto,
  ) {}
}
