import { ICommand } from '@nestjs/cqrs';
import { AdminUserAccountID } from 'src/domain/value-objects/admin-user-account-id.value-object';

export class RemoveAdminUserAccountCommand implements ICommand {
  constructor(public readonly id: AdminUserAccountID) {}
}
