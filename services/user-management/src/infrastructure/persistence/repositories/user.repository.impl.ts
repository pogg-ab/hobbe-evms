import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follower } from 'src/domain/entities/follower.entity';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { EntityManager, Repository } from 'typeorm';
@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Follower)
    private followerRepository: Repository<Follower>,

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

      const followersCount = await this.followerRepository.count({
        where: { following: user },
      });

      const followingCount = await this.followerRepository.count({
        where: { follower: user },
      });

      userAccountInfo['followers_count'] = followersCount;
      userAccountInfo['following_count'] = followingCount;

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
        relations: ['personal_account', 'organizational_account', 'organizational_account.owner',
          'organizational_account.kyc']
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
      const followersCount = await this.followerRepository.count({
        where: { following: user },
      });

      const followingCount = await this.followerRepository.count({
        where: { follower: user },
      });

      userAccountInfo['followers_count'] = followersCount;
      userAccountInfo['following_count'] = followingCount;


      return userAccountInfo;
    } catch (error) {
      throw new HttpException(
        `Error finding User by ID: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllUsers(page: number, limit: number): Promise<{
    users: any | null;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      const users = await this.userRepository.find({
        relations: [
          'personal_account',
          'organizational_account',
          'organizational_account.owner',
          'organizational_account.kyc',
        ],
        take: limit,
        skip: offset,
      });

      if (!users || users.length === 0) {
        return {
          users: null,
          total: 0,
          page,
          limit,
        };
      }

      const total = await this.userRepository.count();


      const userAccountInfo = await Promise.all(
        users.map(async (user) => {
          const followersCount = await this.followerRepository.count({
            where: {
              following: user,
            },
          });

          const followingCount = await this.followerRepository.count({
            where: {
              follower: user,
            },
          });

          return {
            user_id: user.user_id,
            user_name: user.user_name,
            account_type: user.account_type,
            account_info:
              user.account_type === 'personal'
                ? user.personal_account
                : user.organizational_account,
            followers_count: followersCount,
            following_count: followingCount,
          };
        })
      );
      return {
        users: userAccountInfo || null,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new HttpException(
        `Error finding Users: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(user: User): Promise<User> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { user_id: user.user_id },
      });

      if (!existingUser) {
        throw new HttpException(
          `User with ID ${user.user_id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedUser = Object.assign(existingUser, user);

      return await this.userRepository.save(updatedUser);
    } catch (error) {
      throw new HttpException(
        `Error updating User: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
