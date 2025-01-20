import { Favorite } from "src/domain/entities/favorite.entity"


export interface IFavoriteEventsRepository{
    favoriteEvent(user_id: string, event_id: string): Promise<{message: string}>
    unFavoriteEvent(user_id: string, event_id: string): Promise<void>
    findOne(user_id: string, event_id: string): Promise<Favorite>
    allFavoritesCounter():Promise<{ totalFavorites: number }>
    eventFavoritesCounter(event_id:string):Promise<{ totalEventFavorites: number }>
}