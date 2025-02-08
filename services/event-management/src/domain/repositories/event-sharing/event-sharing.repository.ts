import { EventShare } from "src/domain/entities/event-share.entity";


export interface IEventShareRepository {
    create(eventShare: EventShare): Promise<EventShare>;
}
