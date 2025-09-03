import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AppDownloadsByDateQuery } from "src/application/queries/reports/app-users/downloads-by-date.query";
import { AnalyticsService } from "src/application/services/report/analytics.service";


@QueryHandler(AppDownloadsByDateQuery)
export class DownloadsByDateQueryHandler implements IQueryHandler<AppDownloadsByDateQuery> {
    constructor(
        private readonly analyticsService: AnalyticsService,
    ) {}

    async execute(query: AppDownloadsByDateQuery): Promise<any> {
        const { dto } = query;
        return await this.analyticsService.getDownloadsByDate(dto);
    }
}