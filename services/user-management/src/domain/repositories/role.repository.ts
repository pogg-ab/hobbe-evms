import { FindManyOptions } from 'typeorm';
import { Role } from '../entities/role.entity';

export interface IRoleRepository {
  create(role: Role): Promise<Role>;
  find(options?: FindManyOptions<Role>): Promise<Role[]>;
  findOneById(id: string): Promise<Role | null>;
  findOneBy(criteria: { [key: string]: any }): Promise<Role | null>;
  update(id: string, role: Role): Promise<Role>;
  delete(id: string): Promise<void>;
}
