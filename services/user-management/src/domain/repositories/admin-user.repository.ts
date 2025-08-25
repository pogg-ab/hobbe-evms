// src/domain/repositories/admin-user.repository.ts

import { AdminUser } from '../entities/admin-user.entity';
import { AdminUserAccountID } from '../value-objects/admin-user-account-id.value-object';
import { AdminUserID } from '../value-objects/admin-user-id.value-object';

export interface IAdminUserRepository {
  create(adminUser: AdminUser): Promise<AdminUser>;
  findAll(): Promise<AdminUser[]>;
  findOneById(id: AdminUserID): Promise<AdminUser | null>;
  
  // --- ADD THIS NEW METHOD SIGNATURE ---
  findOneByAccountId(accountId: AdminUserAccountID): Promise<AdminUser | null>;
  
  update(id: AdminUserID, adminUser: AdminUser): Promise<AdminUser>;
  delete(id: AdminUserID): Promise<void>;
}