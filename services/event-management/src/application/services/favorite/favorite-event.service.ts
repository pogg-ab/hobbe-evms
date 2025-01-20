import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { Inject, Injectable } from "@nestjs/common";
import { FAVORITE_EVENT_TOKEN } from "src/domain/repositories/favorite/favorite-event.repositort.token";
import { IFavoriteEventsRepository } from "src/domain/repositories/favorite/favorite-event.repository";
import { SocketIo } from "src/infrastructure/socket-io/socket.gateway";


@Injectable()

export class FavoriteEventService {
    constructor(
            @Inject(FAVORITE_EVENT_TOKEN)
            private readonly favoriteEventsRepository: IFavoriteEventsRepository,
            @InjectMapper() private readonly mapper: Mapper,
            private readonly socket:SocketIo
            
    ) {}

    async favoriteEvent(user_id: string, event_id: string): Promise<{message: string}> {
           const favorite = await this.favoriteEventsRepository.favoriteEvent(user_id, event_id);
           const allFavoritesCounter = this.favoriteEventsRepository.allFavoritesCounter();
           const eventFavoritesCounter = this.favoriteEventsRepository.eventFavoritesCounter(event_id);
           this.socket.handleAllEventLikesCounter("All-Time-Likes-Counters : "+(await allFavoritesCounter).totalFavorites);
           this.socket.handleSigleEventLikesCounter({'event_id':event_id, counter:(await eventFavoritesCounter).totalEventFavorites});
           return favorite;
    }
}