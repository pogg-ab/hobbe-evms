import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AnalyticsEventCommand } from "src/application/queries/analytics/analytics-events.query";
import { CountMyEventCommand } from "src/application/queries/analytics/count-my-events.query";
import { EventsService } from "src/application/services/events/events.service";


@QueryHandler(AnalyticsEventCommand)

export class AnalyticsEventCommandHandler implements IQueryHandler<AnalyticsEventCommand>{
    constructor(
        public readonly eventService: EventsService
    ){}
    execute(command: AnalyticsEventCommand): Promise<AnalyticsEventCommand> {
        return this.eventService.analyticsEvent();
    }
    
}