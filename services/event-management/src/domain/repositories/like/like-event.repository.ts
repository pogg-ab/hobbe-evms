import { Like } from "src/domain/entities/likes.entity";


export interface ILikeEventsRepository{
    likeEvent(user_id: string, event_id: string): Promise<{message: string}>
    unlikeEvent(user_id: string, event_id: string): Promise<void>
    findOne(user_id: string, event_id: string): Promise<Like>
}