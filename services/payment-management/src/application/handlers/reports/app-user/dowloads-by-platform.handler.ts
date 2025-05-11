import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AppDownloadsByDateQuery } from "src/application/queries/reports/app-users/downloads-by-date.query";
import { AppDownloadsByPlatformQuery } from "src/application/queries/reports/app-users/downloads-by-platform.query";
import { AnalyticsService } from "src/application/services/report/analytics.service";


@QueryHandler(AppDownloadsByPlatformQuery)
export class DownloadsByPlatformQueryHandler implements IQueryHandler<AppDownloadsByPlatformQuery> {
    constructor(
        private readonly analyticsService: AnalyticsService,
    ) {}

    async execute(query: AppDownloadsByPlatformQuery): Promise<any> {
        const { platform } = query;
        return await this.analyticsService.getDownloadsByPlatform(platform);
    }
}