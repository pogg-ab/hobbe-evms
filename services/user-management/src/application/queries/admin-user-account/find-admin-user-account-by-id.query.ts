import { IQuery } from '@nestjs/cqrs';
import { AdminUserAccountID } from 'src/domain/value-objects/admin-user-account-id.value-object';

export class FindAdminUserAccountByIdQuery implements IQuery {
  constructor(public readonly id: AdminUserAccountID) {}
}
