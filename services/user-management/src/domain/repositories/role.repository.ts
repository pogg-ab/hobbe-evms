import { FindManyOptions } from 'typeorm'; // <-- IMPORT THIS
import { Role } from '../entities/role.entity';

export interface IRoleRepository {
  create(role: Role): Promise<Role>;
  
  // OLD WAY: find(): Promise<Role[]>;
  // --- NEW, MORE POWERFUL WAY ---
  // This now allows the find method to optionally accept standard TypeORM find options.
  find(options?: FindManyOptions<Role>): Promise<Role[]>;

  findOneById(id: string): Promise<Role | null>;
  findOneBy(criteria: { [key: string]: any }): Promise<Role | null>;
  update(id: string, role: Role): Promise<Role>;
  delete(id: string): Promise<void>;
}