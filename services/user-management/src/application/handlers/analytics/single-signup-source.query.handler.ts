import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { SingupSourcesQuery } from "src/application/queries/analytics/signup-source.query";
import { SingleSingupSourcesQuery } from "src/application/queries/analytics/single-signup-source.query";
import { UserAnalyticsService } from "src/application/services/analytics/user-analytics.service";


@QueryHandler(SingleSingupSourcesQuery)
export class SingleSignupSourcesQueryHandler
    implements IQueryHandler<SingleSingupSourcesQuery> {
    constructor(private readonly userAnalyticsService: UserAnalyticsService) { }

    async execute(query: SingleSingupSourcesQuery): Promise<any> {
        const { userId } = query;
        if (!userId) {
            throw new Error("User ID is required to fetch single signup sources.");
        }
        return this.userAnalyticsService.getSingleSignupSources(userId);
    }
}

