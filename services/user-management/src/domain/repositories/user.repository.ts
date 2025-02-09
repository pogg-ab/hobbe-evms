import { EntityManager } from 'typeorm';
import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(manager: EntityManager, user: User): Promise<User>;
  findById(userId: string): Promise<any | null>;
  findByIdWithAccountInfo(userId: string): Promise<any | null>;
  findAllUsers(page: number, limit: number): Promise<{
    users: any | null;
    total: number;
    page: number;
    limit: number;
  }>; update(user: User): Promise<User>;
}
