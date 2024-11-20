import { OrganizationalAccount } from '../entities/organizational-account.entity';
import { OrganizationalAccountID } from '../value-objects/organizational-account-id.value-object';

export interface IOrganizationalAccountRepository {
  create(
    organizationalAccount: OrganizationalAccount,
  ): Promise<OrganizationalAccount>;
  find(): Promise<OrganizationalAccount[]>;
  findOneById(
    organizationalAccountId: OrganizationalAccountID,
  ): Promise<OrganizationalAccount | null>;
  update(
    organizationalAccountId: OrganizationalAccountID,
    organizationalAccount: OrganizationalAccount,
  ): Promise<OrganizationalAccount>;
  delete(organizationalAccountId: string): Promise<void>;
  sendEmailVerificationDb(user_name: string): Promise<any>;
  findByEmail(email: string): Promise<OrganizationalAccount | null>;
}
