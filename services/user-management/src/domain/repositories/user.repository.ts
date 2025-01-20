import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(userId: string): Promise<any | null>;
  findByIdWithAccountInfo(userId: string): Promise<any | null>;
  findAllUsers(): Promise<any | null>;
}
