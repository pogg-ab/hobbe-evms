import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FavoriteEvent } from 'src/domain/entities/favorite-event.entity';
import { IFavoriteEventsRepository } from 'src/domain/repositories/favorite/favorite-event.repository';
import { Repository } from 'typeorm';

@Injectable()
export class FavoriteEventRepositoryImpl implements IFavoriteEventsRepository {
  constructor(
    @InjectRepository(FavoriteEvent)
    private readonly favoriteEventRepository: Repository<FavoriteEvent>,
  ) { }

  /**
   * Toggles the like status of an event for a user.
   */
  async favoriteEvent(
    userId: string,
    eventId: string,
  ): Promise<{ message: string }> {
    const isFavorited = await this.findOne(userId, eventId);

    if (isFavorited) {
      await this.unFavoriteEvent(userId, eventId);
      return { message: 'Event removed from favorite list successfully' };
    } else {
      await this.addFavorite(userId, eventId);
      return { message: 'Event added to favorite list successfully' };
    }
  }

  /**
   * Finds a like record for a user and event.
   */
  async findOne(userId: string, eventId: any): Promise<FavoriteEvent | null> {
    try {
      const favorite = await this.favoriteEventRepository
        .createQueryBuilder('favorite')
        .where('favorite.event_id = :eventId', { eventId })
        .andWhere('favorite.user_id = :userId', { userId })
        .getOne();

      return favorite;
    } catch (error) {
      throw new HttpException(
        `Error fetching favorite for userId ${userId} and eventId ${eventId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Removes a like for a user and event.
   */
  async unFavoriteEvent(userId: string, eventId: any): Promise<void> {
    try {
      await this.favoriteEventRepository.delete({
        user_id: userId,
        event_id: eventId,
      });
    } catch (error) {
      throw new HttpException(
        `Error remove from favorite event list for userId ${userId} and eventId ${eventId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Adds a like for a user and event.
   */
  private async addFavorite(userId: string, eventId: any): Promise<void> {
    try {
      const like = this.favoriteEventRepository.create({
        user_id: userId,
        event_id: eventId,
        created_at: new Date(),
      });
      await this.favoriteEventRepository.save(like);
    } catch (error) {
      throw new HttpException(
        `Error favoriting event for userId ${userId} and eventId ${eventId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async eventFavoritesCounter(
    eventId: string,
  ): Promise<{ totalEventFavorites: number }> {
    if (!eventId) throw new Error('event_id is required for event tracking');
    const favoritesCounter = await this.favoriteEventRepository
      .createQueryBuilder('favorites')
      .where('favorites.event_id = :eventId', { eventId })
      .getCount();

    return { totalEventFavorites: favoritesCounter };
  }

  async allFavoritesCounter(): Promise<{ totalFavorites: number }> {
    const allFavoritesCounter = await this.favoriteEventRepository.count();
    return { totalFavorites: allFavoritesCounter };
  }

  async getFavoriteEvents(user: string): Promise<FavoriteEvent[]> {
    return this.favoriteEventRepository.find({
      where: { user_id: user },
      relations: ['event_id'],
    });
  }
}
