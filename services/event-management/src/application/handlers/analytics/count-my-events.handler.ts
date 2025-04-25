import {  IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CountMyEventCommand } from "src/application/queries/analytics/count-my-events.query";
import { EventsService } from "src/application/services/events/events.service";


@QueryHandler(CountMyEventCommand)

export class CountMyEventCommandHandler implements IQueryHandler<CountMyEventCommand>{
    constructor(
        public readonly eventService: EventsService
    ){}
    execute(command: CountMyEventCommand): Promise<CountMyEventCommand> {
       const {user} =command;

       return this.eventService.countMyEvent(user);
    }
    
}