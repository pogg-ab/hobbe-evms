import {
  HttpException,
  HttpStatus,
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follower } from 'src/domain/entities/follower.entity';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { Client } from '@elastic/elasticsearch';
import { ElasticsearchConfig } from 'src/infrastructure/elasticsearch/elasticsearch.config';
@Injectable()
export class UserRepositoryImpl
  implements IUserRepository, OnApplicationBootstrap
{
  private readonly client: Client;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Follower)
    private followerRepository: Repository<Follower>,
    private readonly elasticsearchConfig: ElasticsearchConfig,
  ) {
    this.client = elasticsearchConfig.getClient();
  }

  async onApplicationBootstrap() {
    await this.backfillUserProfiles();
  }

  private async backfillUserProfiles(): Promise<void> {
    try {
      const usersToUpdate = await this.userRepository.find({
        where: [{ profile_id: IsNull() }, { profile_name: IsNull() }],
        relations: ['personal_account', 'organizational_account'],
      });

      if (usersToUpdate.length > 0) {
        console.log(`Backfilling profiles for ${usersToUpdate.length} users`);

        const batchSize = 100;
        for (let i = 0; i < usersToUpdate.length; i += batchSize) {
          const batch = usersToUpdate.slice(i, i + batchSize);
          await Promise.all(
            batch.map((user) => {
              this.ensureProfileFields(user);
              return this.userRepository.save(user);
            }),
          );
        }

        console.log('Profile backfill completed');
      }
    } catch (error) {
      console.error('Failed to backfill user profiles:', error);
    }
  }
  private ensureProfileFields(user: User): void {
    if (!user.profile_id || !user.profile_name) {
      user.updateProfileDetails();
    }
  }

  async create(manager: EntityManager, user: User): Promise<User> {
    try {
      const newUser = this.userRepository.create(user);
      const savedUser = await manager.save(newUser);

      await this.indexUser(savedUser);

      return savedUser;
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
        profile_id: user.profile_id,
        profile_name: user.profile_name,
        account_info:
          user.account_type === 'personal'
            ? user.personal_account
            : user.organizational_account,
      };

      const followersCount = await this.followerRepository
        .createQueryBuilder('follower')
        .where('follower.following_user_id = :userId', { userId: user.user_id })
        .getCount();

      const followingCount = await this.followerRepository
        .createQueryBuilder('follower')
        .where('follower.follower_user_id = :userId', { userId: user.user_id })
        .getCount();

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
        relations: [
          'personal_account',
          'organizational_account',
          'organizational_account.owner',
          'organizational_account.kyc',
        ],
      });

      if (!user) {
        return null;
      }

      const userAccountInfo = {
        user_id: user.user_id,
        user_name: user.user_name,
        account_type: user.account_type,
        profile_id: user.profile_id,
        profile_name: user.profile_name,
        account_info:
          user.account_type === 'personal'
            ? user.personal_account
            : user.organizational_account,
      };

      const followersCount = await this.followerRepository
        .createQueryBuilder('follower')
        .where('follower.following_user_id = :userId', { userId: user.user_id })
        .getCount();

      const followingCount = await this.followerRepository
        .createQueryBuilder('follower')
        .where('follower.follower_user_id = :userId', { userId: user.user_id })
        .getCount();

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

  async findAllUsers(
    page: number,
    limit: number,
  ): Promise<{
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
          const followersCount = await this.followerRepository
            .createQueryBuilder('follower')
            .where('follower.following_user_id = :userId', {
              userId: user.user_id,
            })
            .getCount();

          const followingCount = await this.followerRepository
            .createQueryBuilder('follower')
            .where('follower.follower_user_id = :userId', {
              userId: user.user_id,
            })
            .getCount();

          return {
            user_id: user.user_id,
            user_name: user.user_name,
            account_type: user.account_type,
            profile_id: user.profile_id,
            profile_name: user.profile_name,
            account_info:
              user.account_type === 'personal'
                ? user.personal_account
                : user.organizational_account,
            followers_count: followersCount,
            following_count: followingCount,
          };
        }),
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

  async findAllUsersOnly(): Promise<any> {
    return await this.userRepository.find();
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
  async indexUser(user: User) {
    const result = await this.client.index({
      index: 'users',
      id: user.user_id.toString(),
      body: {
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.user_name,
        isActive: user.is_active,
      },
    });
    return result;
  }

  async search(
    query: string,
    filters: any,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const from = (page - 1) * limit;
    const body: any = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ['name^2', 'user_name'],
              },
            },
          ],
          filter: [
            filters.isActive !== undefined
              ? { term: { isActive: filters.isActive } }
              : undefined,
          ].filter(Boolean),
        },
      },
      from,
      size: limit,
    };

    try {
      const response = await this.client.search({
        index: 'users',
        body,
      });
      const results = response.hits.hits.map((hit) => hit._source);

      return results;
    } catch (error) {
      throw new Error(`Error executing Elasticsearch query: ${error.message}`);
    }
  }

  async findActiveUsers(
    page: number,
    limit: number,
  ): Promise<{
    users: any | null;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      const users = await this.userRepository.find({
        where: { is_active: true },
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
          const followersCount = await this.followerRepository
            .createQueryBuilder('follower')
            .where('follower.following_user_id = :userId', {
              userId: user.user_id,
            })
            .getCount();

          const followingCount = await this.followerRepository
            .createQueryBuilder('follower')
            .where('follower.follower_user_id = :userId', {
              userId: user.user_id,
            })
            .getCount();

          return {
            user_id: user.user_id,
            user_name: user.user_name,
            account_type: user.account_type,
            profile_id: user.profile_id,
            profile_name: user.profile_name,
            account_info:
              user.account_type === 'personal'
                ? user.personal_account
                : user.organizational_account,
            followers_count: followersCount,
            following_count: followingCount,
          };
        }),
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
}
