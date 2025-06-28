import { InjectRepository } from "@nestjs/typeorm";
import { OAuthProvider } from "src/domain/entities/oauth-provider.entity";
import { User } from "src/domain/entities/user.entity";
import { ISignupSourcesRepository } from "src/domain/repositories/signup-sources.repositoy";
import { Repository } from "typeorm";

export class SignupSourcesRepositoryImpl implements ISignupSourcesRepository {
    constructor(
        @InjectRepository(User)
        private readonly user: Repository<User>,

        @InjectRepository(OAuthProvider)
        private readonly outhProvider: Repository<OAuthProvider>,

      ) { }
    async getSignupSources(): Promise<any> {
        // This is a mock implementation. Replace with actual database logic.
        const userCount = await this.user.count();
        const oauthProviderCount = await this.outhProvider.count();
        const details = await this.outhProvider.
         createQueryBuilder('oauth')
        .select('oauth.provider', 'provider')
        .addSelect('COUNT(*)', 'count')
        .groupBy('oauth.provider')
        .getRawMany();

        return {
            sources: [
                { 
                    'Email Signup': userCount,
                    'SSO Signup': oauthProviderCount ,
                     "Details": details 
                },
            ],
        };
    }

   
    async getSingleSignupSources(user_id: string): Promise<any> {
        // This is a mock implementation. Replace with actual database logic.
        console.log("User ID From IMPL :", user_id);
        
        const user = await this.user.findOne({ where: { user_id } });
        if (!user) {
            throw new Error(`User with ID ${user_id} not found`);
        }
        const oauthProviders = await this.outhProvider.find({
            where: { user: { user_id } },
            relations: ['user'],
        });
        if (!oauthProviders || oauthProviders.length === 0) {
            throw new Error(`No OAuth providers found for user with ID ${user_id}`);
        }
        const details = oauthProviders.map(provider => ({
            provider: provider.provider,
            user_id: provider.user.user_id,
            created_at: provider.created_at.toISOString(),
        }));
        console.log("Details:", details);
        console.log("User:", user);
        
        return {
            user_id: user.user_id,
            // email: this.oauthProviders.user.email,
            signup_sources: details,
        };
    }


}