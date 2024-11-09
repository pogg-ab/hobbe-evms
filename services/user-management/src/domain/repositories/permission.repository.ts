import { Permission } from '../entities/permission.entity';

export interface IPermissionRepository {
  create(permission: Permission): Promise<Permission>;
  find(): Promise<Permission[]>;
  findOneById(id: string): Promise<Permission | null>;
  update(id: string, role: Permission): Promise<Permission>;
  delete(id: string): Promise<void>;
}
