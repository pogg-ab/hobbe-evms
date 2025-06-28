import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignupSourcesQueryHandler } from 'src/application/handlers/analytics/signup-source.query.handler';
import { SingleSignupSourcesQueryHandler } from 'src/application/handlers/analytics/single-signup-source.query.handler';
import { SingupSourcesQuery } from 'src/application/queries/analytics/signup-source.query';
import { UserAnalyticsService } from 'src/application/services/analytics/user-analytics.service';
import { OAuthProvider } from 'src/domain/entities/oauth-provider.entity';
import { User } from 'src/domain/entities/user.entity';
import { SIGNUP_SOURCES_REPOSITORY_TOKEN } from 'src/domain/repositories/signup-sources.repository.tocken';
import { SignupSourcesRepositoryImpl } from 'src/infrastructure/persistence/repositories/signup-sources.repository.impl';
import { UserAnalyticsController } from 'src/presentation/controllers/analytics/user-analytics/user-analytics.controller';

@Module({
    imports: [
           AutomapperModule,
           TypeOrmModule.forFeature([User,OAuthProvider]),
           CqrsModule,
       ],
    controllers: [UserAnalyticsController],
    providers: [
        UserAnalyticsService, 
        SingupSourcesQuery,
        SignupSourcesQueryHandler,
         SingupSourcesQuery,
        SingleSignupSourcesQueryHandler,

        {
            provide: SIGNUP_SOURCES_REPOSITORY_TOKEN,
            useClass: SignupSourcesRepositoryImpl,
        }
    ],
})
export class UserAnayticsModule {}
