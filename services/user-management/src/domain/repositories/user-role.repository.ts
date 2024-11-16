import { UserRole } from '../entities/user-role.entity';

export interface IUserRoleRepository {
  create(userRole: UserRole): Promise<UserRole>;
}
