import { OrganizationalAccount } from '../entities/organizational-account.entity';

export interface IOrganizationalAccountRepository {
  create(
    organizationalAccount: OrganizationalAccount,
  ): Promise<OrganizationalAccount>;
  findOneById(
    organizationalAccountId: string,
  ): Promise<OrganizationalAccount | null>;
  update(
    organizationalAccountId: string,
    organizationalAccount: OrganizationalAccount,
  ): Promise<OrganizationalAccount>;
  remove(organizationalAccountId: string): Promise<void>;
}
