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
import {
  AccountStatus,
  Status,
} from 'src/domain/value-objects/account-status.value-object';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { Connection } from 'typeorm';
import { AccountType } from 'src/domain/value-objects/account-type.value-object';
import { SearchFilters } from 'src/presentation/dtos/search-filters.dto';

@Injectable()
export class UserRepositoryImpl
  implements IUserRepository, OnApplicationBootstrap
{
  private readonly client: Client;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PersonalAccount)
    private personalAccountRepository: Repository<PersonalAccount>,
    @InjectRepository(OrganizationalAccount)
    private organizationalAccountRepository: Repository<OrganizationalAccount>,
    @InjectRepository(Follower)
    private followerRepository: Repository<Follower>,
    private readonly elasticsearchConfig: ElasticsearchConfig,
    private connection: Connection,
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
            is_active: user.is_active,
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

  async searchUsersWithFilters(
    searchTerm: string,
    filters: SearchFilters,
    page: number,
    limit: number,
  ): Promise<{
    users: any[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      const queryBuilder = this.userRepository.createQueryBuilder('user');

      queryBuilder.leftJoinAndSelect(
        'user.personal_account',
        'personal_account',
      );
      queryBuilder.leftJoinAndSelect(
        'user.organizational_account',
        'organizational_account',
      );
      queryBuilder.leftJoinAndSelect('organizational_account.owner', 'owner');
      queryBuilder.leftJoinAndSelect('organizational_account.kyc', 'kyc');

      if (searchTerm) {
        queryBuilder.andWhere('user.user_name ILIKE :searchTerm', {
          searchTerm: `%${searchTerm}%`,
        });
      }

      if (filters.name) {
        queryBuilder.andWhere('user.user_name ILIKE :name', {
          name: `%${filters.name}%`,
        });
      }

      if (filters.email) {
        queryBuilder.andWhere('user.email ILIKE :email', {
          email: `%${filters.email}%`,
        });
      }

      if (filters.accountType) {
        queryBuilder.andWhere('user.account_type = :accountType', {
          accountType: filters.accountType,
        });
      }

      queryBuilder.take(limit).skip(offset);

      const users = await queryBuilder.getMany();

      if (!users || users.length === 0) {
        return {
          users: null,
          total: 0,
          page,
          limit,
        };
      }

      const total = await queryBuilder.getCount();

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
            email: user.user_name,
            account_type: user.account_type,
            profile_id: user.profile_id,
            profile_name: user.profile_name,
            is_active: user.is_active,
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
        users: userAccountInfo,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new HttpException(
        `Error searching users: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllUsersOnly(): Promise<any> {
    return await this.userRepository.find({
      where: {
        is_active: true,
      },
    });
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
                fields: ['profile_id^2', 'profile_name'],
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

  async suspendUser(userId: string): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { user_id: userId },
        select: ['user_id', 'user_name', 'account_type', 'is_active'],
        loadRelationIds: true,
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          status: 'NOT_FOUND',
        };
      }

      if (!user.is_active) {
        return {
          success: true,
          message: 'User was already suspended',
          user,
          status: 'ALREADY_SUSPENDED',
        };
      }

      const accountId =
        user.account_type === AccountType.PERSONAL
          ? (user as any).personal_account
          : (user as any).organizational_account;

      const isPersonal = user.account_type === AccountType.PERSONAL;
      const accountEntity = isPersonal
        ? PersonalAccount
        : OrganizationalAccount;
      const accountIdField = isPersonal
        ? { personal_account_id: accountId.personal_account_id }
        : { organizational_account_id: accountId.organizational_account_id };
      const account = await queryRunner.manager.findOne(accountEntity, {
        where: accountIdField,
      });

      if (!account) {
        throw new HttpException(
          `${user.account_type} account not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      user.is_active = false;
      user.updated_date = new Date();
      await queryRunner.manager.update(User, user.user_id, {
        is_active: false,
        updated_date: new Date(),
      });
      account.status = Status.SUSPENDED;
      account.updated_date = new Date();
      await queryRunner.manager.save(accountEntity, account);
      await queryRunner.commitTransaction();

      try {
        await this.client.update({
          index: 'users',
          id: user.user_id.toString(),
          body: {
            doc: {
              isActive: false,
              suspendedAt: user.updated_date.toISOString(),
            },
          },
        });
      } catch (esError) {
        throw new HttpException(
          'User suspended but Elasticsearch sync failed. Reverted DB changes.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        success: true,
        message: 'User suspended successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw new HttpException(
        `Error suspending user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async reactivateUser(userId: string): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    let transactionStarted = false;

    try {
      await queryRunner.startTransaction();
      transactionStarted = true;
      const user = await queryRunner.manager.findOne(User, {
        where: { user_id: userId },
        select: ['user_id', 'user_name', 'account_type', 'is_active'],
        loadRelationIds: true,
      });

      if (!user) {
        if (transactionStarted) await queryRunner.rollbackTransaction();

        return {
          success: false,
          message: 'User not found',
          status: 'NOT_FOUND',
        };
      }

      if (user.is_active) {
        if (transactionStarted) await queryRunner.rollbackTransaction();
        return {
          success: true,
          message: 'User was already active',
          user,
          status: 'ALREADY_ACTIVE',
        };
      }

      const accountId =
        user.account_type === AccountType.PERSONAL
          ? (user as any).personal_account
          : (user as any).organizational_account;

      let account;
      if (user.account_type === AccountType.PERSONAL) {
        account = await queryRunner.manager.findOne(PersonalAccount, {
          where: { personal_account_id: accountId.personal_account_id },
        });
      } else {
        account = await queryRunner.manager.findOne(OrganizationalAccount, {
          where: {
            organizational_account_id: accountId.organizational_account_id,
          },
        });
      }

      if (!account) {
        if (transactionStarted) await queryRunner.rollbackTransaction();
        throw new HttpException(
          `${user.account_type} account not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      user.is_active = true;
      user.updated_date = new Date();
      await queryRunner.manager.save(User, user);

      account.status = Status.ACTIVE;
      account.updated_date = new Date();
      await queryRunner.manager.save(account);

      await queryRunner.commitTransaction();

      try {
        await this.client.update({
          index: 'users',
          id: user.user_id.toString(),
          body: {
            doc: {
              isActive: true,
              reactivatedAt: user.updated_date.toISOString(),
            },
          },
        });
      } catch (esError) {
        throw new HttpException(
          'User reactivated but Elasticsearch sync failed. Reverted DB changes.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        success: true,
        message: 'User reactivated successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (transactionStarted) await queryRunner.rollbackTransaction();
      throw new HttpException(
        `Error reactivating user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
  async findAllUserIds(): Promise<string[]> {
    try {
      // This is a highly efficient query that only fetches the user_id column
      const users = await this.userRepository.find({
        select: ['user_id'],
        where: { is_active: true }, // We should only broadcast to active users
      });
      return users.map((user) => user.user_id.toString());
    } catch (error) {
      throw new HttpException(
        `Error finding all User IDs: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
