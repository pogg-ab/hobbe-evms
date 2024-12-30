import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { Inject, Injectable } from "@nestjs/common";
import { LIKE_EVENT_TOKEN } from "src/domain/repositories/like/like-event.repositort.token";
import { ILikeEventsRepository } from "src/domain/repositories/like/like-event.repository";


@Injectable()

export class LikeEventService {
    constructor(
            @Inject(LIKE_EVENT_TOKEN)
            private readonly likeEventsRepository: ILikeEventsRepository,
            @InjectMapper() private readonly mapper: Mapper,
            
    ) {}

    async likeEvent(user_id: string, event_id: string): Promise<{message: string}> {
           return await this.likeEventsRepository.likeEvent(user_id, event_id);
    }
}