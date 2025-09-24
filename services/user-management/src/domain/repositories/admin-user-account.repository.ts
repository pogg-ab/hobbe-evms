import { AdminUserAccount } from '../entities/admin-user-account.entity';
import { AdminUser } from '../entities/admin-user.entity';
import { AdminUserAccountID } from '../value-objects/admin-user-account-id.value-object';

export interface IAdminUserAccountRepository {
  create(adminUserAccount: AdminUserAccount): Promise<AdminUserAccount>;
  findAll(): Promise<AdminUserAccount[]>;
  findAllAdminUsers(): Promise<AdminUser[]>;

  // findOneById(id: AdminUserAccountID): Promise<AdminUserAccount | null>;
  findOneById(
    id: AdminUserAccountID | string,
  ): Promise<AdminUserAccount | null>;
  update(
    id: string,
    adminUserAccount: AdminUserAccount,
  ): Promise<AdminUserAccount>;
  delete(id: string): Promise<void>;
}
