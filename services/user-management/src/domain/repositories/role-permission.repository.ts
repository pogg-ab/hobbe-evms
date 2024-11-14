import { RolePermission } from '../entities/role-permission.entity';

export interface IRolePermissionRepository {
  create(rolePermission: RolePermission): Promise<RolePermission>;
}
