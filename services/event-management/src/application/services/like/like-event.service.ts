import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { Inject, Injectable } from "@nestjs/common";
import { LIKE_EVENT_TOKEN } from "src/domain/repositories/like/like-event.repositort.token";
import { ILikeEventsRepository } from "src/domain/repositories/like/like-event.repository";
import { SocketIo } from "src/infrastructure/socket-io/socket.gateway";


@Injectable()

export class LikeEventService {
    constructor(
            @Inject(LIKE_EVENT_TOKEN)
            private readonly likeEventsRepository: ILikeEventsRepository,
            @InjectMapper() private readonly mapper: Mapper,
            private readonly socket:SocketIo
            
    ) {}

    async likeEvent(user_id: string, event_id: string): Promise<{message: string}> {
           const like = await this.likeEventsRepository.likeEvent(user_id, event_id);
           const allLikesCounter = this.likeEventsRepository.allLikesCounter();
           const eventLikesCounter = this.likeEventsRepository.eventLikesCounter(event_id);
           this.socket.handleAllEventLikesCounter("All-Time-Likes-Counters : "+(await allLikesCounter).totalLikes);
           this.socket.handleSigleEventLikesCounter({'event_id':event_id, counter:(await eventLikesCounter).totalEventLikes});
           return like;
    }
}