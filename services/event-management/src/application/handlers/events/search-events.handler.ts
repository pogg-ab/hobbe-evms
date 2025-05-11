import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { SearchEventQuery } from "src/application/queries/events/search-event.query";
import { EventsService } from "src/application/services/events/events.service";
import { Events } from "src/domain/entities/events.entity";
import { QueryBuilder } from "typeorm";


@QueryHandler(SearchEventQuery)

export class SearchEventQueryHandler implements IQueryHandler<SearchEventQuery>{
    
    constructor(private readonly eventsService:EventsService){}
    execute(query: SearchEventQuery): Promise<{events:Events[] | null,total:number}> {
        const { keyword , page , limit} = query;
        return this.eventsService.search(keyword,page,limit);
    }
}