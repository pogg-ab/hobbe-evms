import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateCommentsCommand } from "src/application/commands/comments/update-comments.command";
import { CommentsServices } from "src/application/services/comments/commnets.service";
import { Comments } from "src/domain/entities/comments.entity";

@CommandHandler(UpdateCommentsCommand)

export class UpdateCommentsCommandHandler implements ICommandHandler<UpdateCommentsCommand> {
    constructor(
        private readonly commentsServices : CommentsServices
    ) {}

    execute(command: UpdateCommentsCommand): Promise<Comments> {
        // Implement your business logic here
        const { comment_id,commentsDto }  = command;

        return this.commentsServices.update(comment_id,commentsDto) ;
    }
}