import { CommandHandler, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindEventsByUsersFavoriteQuery } from "src/application/queries/favorite/find-events-by-users-favorite.query";
import { FavoriteEventService } from "src/application/services/favorite/favorite-event.service";
import { Favorite } from "src/domain/entities/favorite.entity";



@QueryHandler(FindEventsByUsersFavoriteQuery)

export class FindEventsByUsersFavoriteQueryHandler implements IQueryHandler<FindEventsByUsersFavoriteQuery> {
       constructor(private readonly favoriteEventService: FavoriteEventService) {}
   
    execute(query: FindEventsByUsersFavoriteQuery): Promise<Favorite[] | []> {
        const {user} = query;
        
        return this.favoriteEventService.getFavoriteEvents(user);
    }
    
}