import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppDownloadsByCountryQuery } from 'src/application/queries/reports/app-users/downloads-by-country.query';
import { AnalyticsService } from 'src/application/services/report/analytics.service';
@QueryHandler(AppDownloadsByCountryQuery)
export class DownloadsByCountryQueryHandler implements IQueryHandler<AppDownloadsByCountryQuery> {
    constructor(
        private readonly analyticsService: AnalyticsService,
    ) {}

    async execute(query: AppDownloadsByCountryQuery): Promise<any> {
        const { country } = query;
        return await this.analyticsService.getDownloadsByCountry(country);
    }
}