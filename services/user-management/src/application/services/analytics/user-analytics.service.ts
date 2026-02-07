import { Inject, Injectable } from '@nestjs/common';
import { IActiveUsersRepository } from 'src/domain/repositories/active-users.repository';
import { ACTIVE_USERS_REPOSITORY_TOKEN } from 'src/domain/repositories/active-users.repository.token';
import { SIGNUP_SOURCES_REPOSITORY_TOKEN } from 'src/domain/repositories/signup-sources.repository.tocken';
import { ISignupSourcesRepository } from 'src/domain/repositories/signup-sources.repositoy';

@Injectable()
export class UserAnalyticsService {
  constructor(
    @Inject(SIGNUP_SOURCES_REPOSITORY_TOKEN)
    private readonly signupSourcesRepository: ISignupSourcesRepository,
    @Inject(ACTIVE_USERS_REPOSITORY_TOKEN)
    private readonly activeUsersRepository: IActiveUsersRepository,
  ) {}

  async getSignupSources(): Promise<any> {
    return await this.signupSourcesRepository.getSignupSources();
  }

  async getSingleSignupSources(user_id: string): Promise<any> {
    return await this.signupSourcesRepository.getSingleSignupSources(user_id);
  }

  async getActiveUsers(
    period: 'daily' | 'weekly' | 'monthly',
    page: number,
    limit: number,
  ): Promise<any> {
    return await this.activeUsersRepository.getActiveUsers(period, page, limit);
  }
}
