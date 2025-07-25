import { EventShare } from 'src/domain/entities/event-share.entity';

export interface IEventShareRepository {
  create(eventShare: EventShare): Promise<EventShare>;
  getShareEvents(user_id: string): Promise<EventShare[] | null>;
  findOne(user_id: string, event_id: string): Promise<EventShare>;
  allShareCounter(): Promise<{ totalFavorites: number }>;
  eventShareCounter(
    event_id: string,
  ): Promise<{ totalEventShare: number }>;
}
