import { HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsServices } from 'src/application/services/comments/commnets.service';
import { Comments } from 'src/domain/entities/comments.entity';
import { ICommentsRepository } from 'src/domain/repositories/comments/comments.repository';
import { DataSource, EntityManager, Equal, Repository } from 'typeorm';

@Injectable()
export class CommentsRepositoryImpl implements ICommentsRepository {
  constructor(
    @InjectRepository(Comments)
    private readonly commentsRepository: Repository<Comments>,
    private readonly dataSource: DataSource,
  ) {}
  private readonly logger = new Logger(CommentsServices.name);


  /**
   * Toggles the like status of an event for a user.
   */
  async create(comments: Comments): Promise<Comments> {
    try {
      return this.commentsRepository.save(comments);
    } catch (error) {
      throw new HttpException(
        `Error creating Comments: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(comment_id: string): Promise<Comments | null> {
    try {
      const comment = await this.commentsRepository.findOne({ where: { id: comment_id } });

      if (!comment) {
        this.logger.warn(`Comment with ID ${comment_id} not found`);
        throw new NotFoundException(`Comment with ID ${comment_id} not found`);
      }

      return comment;
    } catch (error) {
      this.logger.error(`Error fetching comment with ID ${comment_id}`, error.stack);
      throw new InternalServerErrorException(
        `An unexpected error occurred while fetching the comment. Please try again later.`,
      );
    }
  }

  async findAllByEvent(event_id: string): Promise<Comments[]> {
    try {
      const data = `SELECT * FROM comments
        WHERE event_id = '${event_id}'
         ORDER BY created_at DESC
        `;
      const commnets = this.dataSource.query(data);
      if (!commnets) {
        throw new HttpException(
          `No Comments found for event with id ${event_id}`,
          HttpStatus.NOT_FOUND,
        );
      }

      return commnets;
    } catch (error) {
      console.error('Error fetching tickets list:', error);
      throw new HttpException(
        `Error fetching Tickets List with Tickets id ${event_id}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(comment_id: string, comments: Comments): Promise<Comments> {
    try {
      const commmetsToBeUpdate = await this.findOne(comment_id);

      const updatedComments = Object.assign(commmetsToBeUpdate, comments);

      return await this.commentsRepository.save(updatedComments);
    } catch (error) {
      throw new HttpException(
        `Error updating comments: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const comment = await this.findOne(id);
      await this.commentsRepository.delete(id);
    } catch (error) {
      throw new HttpException(
        `Error updating commnets: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async eventCommentsCounter(
    eventId: string,
  ): Promise<{ totalEventComments: number }> {
    if (!eventId) throw new Error('event_id is required for event tracking');
    const commentsCounter = await this.commentsRepository
      .createQueryBuilder('comment')
      .where('comment.event_id = :eventId', { eventId })
      .getCount();

    return { totalEventComments: commentsCounter };
  }

  async allCommentsCounter(): Promise<{ totalComments: number }> {
    const allCommentsCounter = await this.commentsRepository.count();
    return { totalComments: allCommentsCounter };
  }
}
