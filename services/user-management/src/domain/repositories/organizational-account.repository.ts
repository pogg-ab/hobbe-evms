import { OrganizationalAccount } from '../entities/organizational-account.entity';

export interface IOrganizationalAccountRepository {
  create(
    organizationalAccount: OrganizationalAccount,
  ): Promise<OrganizationalAccount>;
  find(): Promise<OrganizationalAccount[]>;
  findOneById(
    organizationalAccountId: string,
  ): Promise<OrganizationalAccount | null>;
  update(
    organizationalAccountId: string,
    organizationalAccount: OrganizationalAccount,
  ): Promise<OrganizationalAccount>;
  delete(organizationalAccountId: string): Promise<void>;
}
