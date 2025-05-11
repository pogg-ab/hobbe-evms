import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CountMyEventCommand } from "src/application/queries/analytics/count-my-events.query";
import { SingleEventAnalyticsCommand } from "src/application/queries/analytics/single-event-analytics.query";
import { EventsService } from "src/application/services/events/events.service";


@QueryHandler(SingleEventAnalyticsCommand)

export class SingleEventAnalyticsCommandHandler implements IQueryHandler<SingleEventAnalyticsCommand>{
    constructor(
        public readonly eventService: EventsService
    ){}
    execute(command: SingleEventAnalyticsCommand): Promise<SingleEventAnalyticsCommand> {
       const {user,event} =command;

       return this.eventService.singleEventAnalytics(user,event);
    }
    
}