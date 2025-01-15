import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from 'src/domain/entities/likes.entity';
import { ILikeEventsRepository } from 'src/domain/repositories/like/like-event.repository';
import { Repository } from 'typeorm';

@Injectable()
export class LikeEventRepositoryImpl implements ILikeEventsRepository {
  constructor(
    @InjectRepository(Like)
    private readonly likeEventRepository: Repository<Like>,
  ) {}

  /**
   * Toggles the like status of an event for a user.
   */
  async likeEvent(
    userId: string,
    eventId: string,
  ): Promise<{ message: string }> {
    const isLiked = await this.findOne(userId, eventId);

    if (isLiked) {
      await this.unlikeEvent(userId, eventId);
      return { message: 'Event unliked successfully' };
    } else {
      await this.addLike(userId, eventId);
      return { message: 'Event liked successfully' };
    }
  }

  /**
   * Finds a like record for a user and event.
   */
  async findOne(userId: string, eventId: any): Promise<Like | null> {
    try {
      const like = await this.likeEventRepository
        .createQueryBuilder('like')
        .where('like.event_id = :eventId', { eventId })
        .andWhere('like.user_id = :userId', { userId })
        .getOne();

      return like;
    } catch (error) {
      throw new HttpException(
        `Error fetching Like for userId ${userId} and eventId ${eventId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Removes a like for a user and event.
   */
  async unlikeEvent(userId: string, eventId: any): Promise<void> {
    try {
      await this.likeEventRepository.delete({
        user_id: userId,
        event_id: eventId,
      });
    } catch (error) {
      throw new HttpException(
        `Error unliking event for userId ${userId} and eventId ${eventId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Adds a like for a user and event.
   */
  private async addLike(userId: string, eventId: any): Promise<void> {
    try {
      const like = this.likeEventRepository.create({
        user_id: userId,
        event_id: eventId,
        created_at: new Date(),
      });
      await this.likeEventRepository.save(like);
    } catch (error) {
      throw new HttpException(
        `Error liking event for userId ${userId} and eventId ${eventId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async eventLikesCounter(
    eventId: string,
  ): Promise<{ totalEventLikes: number }> {
    if (!eventId) throw new Error('event_id is required for event tracking');
    const likesCounter = await this.likeEventRepository
      .createQueryBuilder('like')
      .where('like.event_id = :eventId', { eventId })
      .getCount();

    return { totalEventLikes: likesCounter };
  }

  async allLikesCounter(): Promise<{ totalLikes: number }> {
    const allLikesCounter = await this.likeEventRepository.count();
    return { totalLikes: allLikesCounter };
  }
}
