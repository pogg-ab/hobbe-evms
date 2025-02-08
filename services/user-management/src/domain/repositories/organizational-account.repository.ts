import { EntityManager } from 'typeorm';
import { OrganizationalAccount } from '../entities/organizational-account.entity';
import { OrganizationalAccountID } from '../value-objects/organizational-account-id.value-object';

export interface IOrganizationalAccountRepository {
  create(manager: EntityManager,
    organizationalAccount: OrganizationalAccount,
  ): Promise<OrganizationalAccount>;
  find(): Promise<OrganizationalAccount[]>;
  findOneById(
    organizationalAccountId: OrganizationalAccountID,
  ): Promise<OrganizationalAccount | null>;
  update(
    organizationalAccountId: OrganizationalAccountID,
    organizationalAccount: OrganizationalAccount,
  ): Promise<any | null>;
  delete(organizationalAccountId: string): Promise<void>;
  sendEmailVerificationDb(user_name: string): Promise<any>;
  findByEmail(email: string): Promise<OrganizationalAccount | null>;
  findByPhoneNumber(
    phone_number: string,
  ): Promise<OrganizationalAccount | null>;
}
