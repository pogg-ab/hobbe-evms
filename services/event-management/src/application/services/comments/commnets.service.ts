import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { Inject, Injectable } from "@nestjs/common";
import { Comments } from "src/domain/entities/comments.entity";
import { ICommentsRepository } from "src/domain/repositories/comments/comments.repository";
import { COMMENTS_REPOSITORY_TOKEN } from "src/domain/repositories/comments/comments.repository.token";
import { CommentsDto } from "src/presentation/dtos/comments/comments.dto";


@Injectable()

export class CommentsServices {
    constructor(
            @Inject(COMMENTS_REPOSITORY_TOKEN)
            private readonly commentsRepository: ICommentsRepository,
            @InjectMapper() private readonly mapper: Mapper,
            
    ) {}

    async create(user:string, commentsDto:CommentsDto): Promise<Comments> {
        const commnets  = this.mapper.map(commentsDto,CommentsDto,Comments);
        commnets.user_id = user;
        return this.commentsRepository.create(commnets);
    }

    async findOne(comment_id: string): Promise<Comments | null> {
       return await this.commentsRepository.findOne(comment_id);
     }

     async findByEvent(event_id: string): Promise<Comments[] | null> {
        return await this.commentsRepository.findAllByEvent(event_id);
      }

      async update(comment_id: string,commnetsDto:CommentsDto): Promise<Comments> {
        const updateComments = this.mapper.map(commnetsDto,CommentsDto,Comments);
        updateComments.updated_at = new Date();
        return await this.commentsRepository.update(comment_id,updateComments);
      }

      async delete(id:string):Promise<void>{
        return await this.commentsRepository.delete(id);
      }
}

