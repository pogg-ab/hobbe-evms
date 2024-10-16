// src/users/domain/user.repository.ts
import { CreateUserDto } from 'src/presentation/dtos/create-user.dto';
import { UpdateUserDto } from 'src/presentation/dtos/update-user.dto';
import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(createUserDto: CreateUserDto): Promise<User>;
  findAll(): Promise<User[]>;
  findOne(id: string): Promise<User | null>;
  update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
  remove(id: string): Promise<void>;
}
