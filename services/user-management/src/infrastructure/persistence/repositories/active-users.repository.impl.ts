// src/infrastructure/repositories/active-users.repository.ts
import { Injectable } from '@nestjs/common';
import { IActiveUsersRepository } from 'src/domain/repositories/active-users.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/domain/entities/user.entity';
import { Auth } from 'src/domain/entities/auth.entity';
import { paginate } from 'src/shared/helpers/pagination.helper';

@Injectable()
export class ActiveUsersRepositoryImpl implements IActiveUsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  async getActiveUsers(
    period: 'daily' | 'weekly' | 'monthly',
    page: number,
    limit: number,
  ): Promise<User[]> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      default:
        throw new Error('Invalid period specified');
    }

    const userLogins = await this.authRepository
      .createQueryBuilder('auth')
      .select('auth.user_id', 'user_id')
      .addSelect('MAX(auth.last_login)', 'last_login')
      .where('auth.last_login >= :startDate', { startDate })
      .groupBy('auth.user_id')
      .orderBy('last_login', 'DESC')
      .getRawMany();

    if (userLogins.length === 0) {
      return [];
    }

    const userIds = userLogins.map((auth) => auth.user_id);

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.user_id',
        'user.user_name',
        'user.profile_id',
        'user.profile_name',
        'user.account_type',
        'user.is_active',
        'user.created_date',
        'user.updated_date',
        'user.personal_account',
        'user.organizational_account',
        'user.updated_by',
      ])
      .where('user.user_id IN (:...userIds)', { userIds })
      .andWhere('user.is_active = :isActive', { isActive: true });

    return paginate(queryBuilder, page, limit).getMany();
  }
}
