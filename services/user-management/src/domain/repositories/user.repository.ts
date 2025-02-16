import { EntityManager } from 'typeorm';
import { User } from '../entities/user.entity';
import { SearchFilters } from 'src/presentation/dtos/search-filters.dto';

export interface IUserRepository {
  create(manager: EntityManager, user: User): Promise<User>;
  findById(userId: string): Promise<any | null>;
  findByIdWithAccountInfo(userId: string): Promise<any | null>;
  findAllUsers(page: number, limit: number): Promise<{
    users: any | null;
    total: number;
    page: number;
    limit: number;
  }>;
  update(user: User): Promise<User>;
  findAllUsersOnly(): Promise<any>;
  search(searchTerm: string, filters: SearchFilters, page: number, limit: number): Promise<User[]>;
}
