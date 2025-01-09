import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RemoveCommentsCommand } from "src/application/commands/comments/remove-comments.command";
import { CommentsServices } from "src/application/services/comments/commnets.service";


@CommandHandler(RemoveCommentsCommand)

export class RemoveCommentsCommandHandler implements ICommandHandler<RemoveCommentsCommand>{
    constructor(
        public readonly commentsServices:CommentsServices
    ){}
    execute(command: RemoveCommentsCommand): Promise<void> {
        return this.commentsServices.delete(command.id);
    }

}