import { Inject, Injectable } from '@nestjs/common';
import { SIGNUP_SOURCES_REPOSITORY_TOKEN } from 'src/domain/repositories/signup-sources.repository.tocken';
import { ISignupSourcesRepository } from 'src/domain/repositories/signup-sources.repositoy';

@Injectable()
export class UserAnalyticsService {
    constructor(
        @Inject(SIGNUP_SOURCES_REPOSITORY_TOKEN) 
        private readonly signupSourcesRepository: ISignupSourcesRepository,
    ){}

    async getSignupSources(): Promise<any> {
        return await this.signupSourcesRepository.getSignupSources();
    }

    async getSingleSignupSources(user_id:string): Promise<any> {
        return await this.signupSourcesRepository.getSingleSignupSources(user_id);
    }
}
