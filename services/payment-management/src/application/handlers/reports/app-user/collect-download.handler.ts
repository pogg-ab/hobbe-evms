import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CollectDownloadCommand } from "src/application/commands/reports/collect-download.command";
import { AnalyticsService } from "src/application/services/report/analytics.service";


@CommandHandler(CollectDownloadCommand)
export class CollectDownloadHandler implements ICommandHandler<CollectDownloadCommand> {
    constructor(
        private readonly analyticsService: AnalyticsService,
    ) {}

    async execute(command: CollectDownloadCommand): Promise<any> {
        const { dto } = command;
        return await this.analyticsService.collectDownload(dto);
    }
}