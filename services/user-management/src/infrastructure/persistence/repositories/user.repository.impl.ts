import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { EntityManager, Repository } from 'typeorm';
@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async create(manager: EntityManager, user: User): Promise<User> {
    try {
      const newUser = this.userRepository.create(user);
      return await manager.save(newUser);
    } catch (error) {
      throw new HttpException(
        `Error creating User: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findById(userId: string): Promise<any | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
        relations: ['personal_account', 'organizational_account'],
      });

      if (!user) {
        return null;
      }

      const userAccountInfo = {
        user_id: user.user_id,
        user_name: user.user_name,
        account_type: user.account_type,
        account_info:
          user.account_type === 'personal'
            ? user.personal_account
            : user.organizational_account,
      };

      return userAccountInfo;
    } catch (error) {
      throw new HttpException(
        `Error finding User by ID: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByIdWithAccountInfo(userId: string): Promise<any | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
        relations: ['personal_account', 'organizational_account'],
      });

      if (!user) {
        return null;
      }

      const userAccountInfo = {
        user_id: user.user_id,
        user_name: user.user_name,
        account_type: user.account_type,
        account_info:
          user.account_type === 'personal'
            ? user.personal_account
            : user.organizational_account,
      };

      return userAccountInfo;
    } catch (error) {
      throw new HttpException(
        `Error finding User by ID: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllUsers(): Promise<any | null> {
    try {
      const user = await this.userRepository.find({
        relations: ['personal_account', 'organizational_account'],
      });

      if (!user) {
        return null;
      }

      const userAccountInfo = user.map(user => ({
        user_id: user.user_id,
        user_name: user.user_name,
        account_type: user.account_type,
        account_info:
          user.account_type === 'personal'
            ? user.personal_account
            : user.organizational_account,
      }));
      return userAccountInfo;
    } catch (error) {
      throw new HttpException(
        `Error finding Users: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
