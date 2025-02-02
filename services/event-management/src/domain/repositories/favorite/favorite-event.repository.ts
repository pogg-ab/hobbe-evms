import { FavoriteEvent } from "src/domain/entities/favorite-event.entity"


export interface IFavoriteEventsRepository {
    favoriteEvent(user_id: string, event_id: string): Promise<{ message: string }>
    unFavoriteEvent(user_id: string, event_id: string): Promise<void>
    getFavoriteEvents(user_id: string): Promise<FavoriteEvent[] | null>
    findOne(user_id: string, event_id: string): Promise<FavoriteEvent>
    allFavoritesCounter(): Promise<{ totalFavorites: number }>
    eventFavoritesCounter(event_id: string): Promise<{ totalEventFavorites: number }>
}