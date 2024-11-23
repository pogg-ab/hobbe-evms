// src/domain/repositories/admin-user-role.repository.ts
import { AdminUserRole } from '../entities/admin-user-role.entity';
import { AdminUserRoleID } from '../value-objects/admin-user-role-id.value-object';

export interface IAdminUserRoleRepository {
  create(adminUserRole: AdminUserRole): Promise<AdminUserRole>;
  findAll(): Promise<AdminUserRole[]>;
  findOneById(id: AdminUserRoleID): Promise<AdminUserRole | null>;
  update(
    id: AdminUserRoleID,
    adminUserRole: AdminUserRole,
  ): Promise<AdminUserRole>;
  delete(id: AdminUserRoleID): Promise<void>;
}
