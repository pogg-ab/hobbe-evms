import { AdminUserAccount } from '../entities/admin-user-account.entity';
import { AdminUserAccountID } from '../value-objects/admin-user-account-id.value-object';

export interface IAdminUserAccountRepository {
  create(adminUserAccount: AdminUserAccount): Promise<AdminUserAccount>;
  findAll(): Promise<AdminUserAccount[]>;
  // findOneById(id: AdminUserAccountID): Promise<AdminUserAccount | null>;
  findOneById(id: AdminUserAccountID | string): Promise<AdminUserAccount | null>;
  update(
    id: AdminUserAccountID,
    adminUserAccount: AdminUserAccount,
  ): Promise<AdminUserAccount>;
  delete(id: AdminUserAccountID): Promise<void>;
}
