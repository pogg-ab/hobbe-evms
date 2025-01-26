import { EntityManager } from 'typeorm';
import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(manager: EntityManager, user: User): Promise<User>;
  findById(userId: string): Promise<any | null>;
  findByIdWithAccountInfo(userId: string): Promise<any | null>;
  findAllUsers(): Promise<any | null>;
}
