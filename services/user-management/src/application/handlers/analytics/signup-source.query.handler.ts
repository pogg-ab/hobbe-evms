import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { SingupSourcesQuery } from "src/application/queries/analytics/signup-source.query";
import { UserAnalyticsService } from "src/application/services/analytics/user-analytics.service";


@QueryHandler(SingupSourcesQuery)
export class SignupSourcesQueryHandler
    implements IQueryHandler<SingupSourcesQuery> {
    constructor(private readonly userAnalyticsService: UserAnalyticsService) { }

    async execute(query: SingupSourcesQuery): Promise<any> {
        return this.userAnalyticsService.getSignupSources();
    }
}

