import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { Comments } from 'src/domain/entities/comments.entity';
import { ICommentsRepository } from 'src/domain/repositories/comments/comments.repository';
import { COMMENTS_REPOSITORY_TOKEN } from 'src/domain/repositories/comments/comments.repository.token';
import { SocketIo } from 'src/infrastructure/socket-io/socket.gateway';
import { CommentsDto } from 'src/presentation/dtos/comments/comments.dto';
import { UserInfoService } from '../user-info/user-info.service';

@Injectable()
export class CommentsServices {
  constructor(
    @Inject(COMMENTS_REPOSITORY_TOKEN)
    private readonly commentsRepository: ICommentsRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly socket: SocketIo,
    private readonly userInfoService: UserInfoService,
    
  ) {}

  async create(user: string, commentsDto: CommentsDto): Promise<Comments> {
    const commnets = this.mapper.map(commentsDto, CommentsDto, Comments);
    commnets.user_id = user;
    const comments = await this.commentsRepository.create(commnets);

    const allCommentsCounter = this.commentsRepository.allCommentsCounter();
    const eventCommentsCounter = this.commentsRepository.eventCommentsCounter(
      comments.event_id.toString(),
    );
    this.socket.handleAllEventsCommentsCounter(
      'All-Event-Comments-Counters : ' + (await allCommentsCounter).totalComments,
    );
    this.socket.handleSingleEventCommentsCounter({
      event_id: comments.event_id.toString(),
      counter: (await eventCommentsCounter).totalEventComments,
    });
    return comments;
  }

  async findOne(comment_id: string): Promise<Comments | null> {
    return await this.commentsRepository.findOne(comment_id);
  }

  async findByEvent(event_id: string): Promise<any> {
    const comments = await this.commentsRepository.findAllByEvent(event_id);

    if (!comments || comments.length === 0) {
      return {
        message: `No comments found for event with id ${event_id}`,
        data: [],
      };
    }
  

    // Get all user IDs for organizer info
    const userIds = comments.map(comment => comment.user_id);
    let userInfoResponse = {};

    try {
      userInfoResponse = await this.userInfoService.getUserInfo(userIds);
    } catch (userInfoError) {
      console.error('Failed to fetch organizer info:', userInfoError);
    }

    const commentsInfo = comments.map(comment => ({
      ...comment,
      commentor: userInfoResponse[comment.user_id] || null
    }));

    return commentsInfo;
  }

  async update(
    comment_id: string,
    commnetsDto: CommentsDto,
  ): Promise<Comments> {
    const updateComments = this.mapper.map(commnetsDto, CommentsDto, Comments);
    updateComments.updated_at = new Date();
    return await this.commentsRepository.update(comment_id, updateComments);
  }

  async delete(id: string): Promise<void> {
    return await this.commentsRepository.delete(id);
  }
}
