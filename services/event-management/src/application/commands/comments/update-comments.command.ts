import { ICommand } from "@nestjs/cqrs";
import { CommentsDto } from "src/presentation/dtos/comments/comments.dto";

export class UpdateCommentsCommand implements ICommand {
    constructor(
        public readonly comment_id: string,
        public readonly commentsDto: CommentsDto,
    ){}
}