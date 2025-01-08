import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindOneCommentsQuery } from "src/application/queries/commnets/find-one-comments.query";
import { CommentsServices } from "src/application/services/comments/commnets.service";
import { Comments } from "src/domain/entities/comments.entity";

@QueryHandler(FindOneCommentsQuery)

export class FindOneCommentsQueryHandler implements IQueryHandler<FindOneCommentsQuery> {
    constructor(
        private readonly commentsServices: CommentsServices,
    ) {}

    execute(query: FindOneCommentsQuery): Promise<Comments | null> {
        const { comment_id } = query;
        return this.commentsServices.findOne(comment_id);
    }
}