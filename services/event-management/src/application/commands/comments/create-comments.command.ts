import { ICommand } from "@nestjs/cqrs";
import { CommentsDto } from "src/presentation/dtos/comments/comments.dto";


export class CreateCommentsCommand implements ICommand {
    constructor(
       public readonly user: string,
       public readonly commentsDto: CommentsDto,
    ) {}
}