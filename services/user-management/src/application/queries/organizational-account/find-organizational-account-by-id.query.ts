import { IQuery } from '@nestjs/cqrs';
import { OrganizationalAccountID } from 'src/domain/value-objects/organizational-account-id.value-object';

export class FindOrganizationalAccountByIdQuery implements IQuery {
  constructor(public readonly id: OrganizationalAccountID) {}
}
