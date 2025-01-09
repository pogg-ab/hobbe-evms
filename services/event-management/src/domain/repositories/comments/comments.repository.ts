import { Comments } from "src/domain/entities/comments.entity"
import { CommentsDto } from "src/presentation/dtos/comments/comments.dto"


export interface ICommentsRepository {
    create(comments:Comments):Promise<Comments>
    findOne(comment_id:string):Promise<Comments | null>
    update(comment_id:string, comments:Comments):Promise<Comments>
    delete(id:string):Promise<void>
    findAllByEvent(event_id:string,):Promise<Comments[]>
}