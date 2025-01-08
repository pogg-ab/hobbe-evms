import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateCommentsCommand } from "src/application/commands/comments/create-comments.command";
import { CommentsServices } from "src/application/services/comments/commnets.service";
import { Comments } from "src/domain/entities/comments.entity";


@CommandHandler(CreateCommentsCommand)

export class CreateCommentsCommandHandler implements ICommandHandler<CreateCommentsCommand>{
    constructor(
        private readonly commentsServices:CommentsServices
    ){}
    execute(command: CreateCommentsCommand): Promise<Comments> {
        const {user, commentsDto } = command;
        return this.commentsServices.create(user, commentsDto);}
}