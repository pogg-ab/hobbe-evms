import { EntityManager } from 'typeorm';
import { UserRole } from '../entities/user-role.entity';

export interface IUserRoleRepository {
  create(manager: EntityManager, userRole: UserRole): Promise<UserRole>;
}
