import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindByEventCommentsQuery } from "src/application/queries/commnets/find-by-event-comments.query";
import { CommentsServices } from "src/application/services/comments/commnets.service";
import { Comments } from "src/domain/entities/comments.entity";

@QueryHandler(FindByEventCommentsQuery)

export class FindByEventCommentsQueryHandler implements IQueryHandler<FindByEventCommentsQuery> {
    constructor(
        private readonly commentsServices: CommentsServices,
    ) {}

    execute(query: FindByEventCommentsQuery): Promise<Comments[] | null> {
        const { event_id } = query;
        return this.commentsServices.findByEvent(event_id);
    }
}