import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from 'src/domain/entities/favorite.entity';
import { IFavoriteRepository } from 'src/domain/repositories/favorite.repository';
import { Repository } from 'typeorm';

@Injectable()
export class FavoriteRepositoryImpl implements IFavoriteRepository {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) { }

  async create(favorite: Favorite): Promise<Favorite> {
    try {
      const newFavorite = this.favoriteRepository.create(favorite);
      return await this.favoriteRepository.save(newFavorite);
    } catch (error) {
      throw new HttpException(
        `Error creating Favorite: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllByUserId(userId: string): Promise<Favorite[]> {
    try {
      return await this.favoriteRepository.find({
        where: [
          { favoriting_user: { user_id: userId } },
          { favorited_user: { user_id: userId } },
        ],
      });
    } catch (error) {
      throw new HttpException(
        `Error fetching Favorites for user with ID ${userId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async delete(id: string): Promise<void> {
    try {
      const favoriteToDelete = await this.favoriteRepository.findOne({
        where: { favorite_id: id },
      });
      if (!favoriteToDelete) {
        throw new HttpException(
          `Favorite with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.favoriteRepository.delete(id);
    } catch (error) {
      throw new HttpException(
        `Error deleting Favorite: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByFavoritingAndFavorited(
    favoritingUserId: string,
    favoritedUserId: string,
  ): Promise<Favorite | null> {
    try {
      return await this.favoriteRepository.findOne({
        where: [
          { favoriting_user: { user_id: favoritingUserId }, favorited_user: { user_id: favoritedUserId } },
          { favoriting_user: { user_id: favoritedUserId }, favorited_user: { user_id: favoritingUserId } },
        ],
      });
    } catch (error) {
      throw new HttpException(
        `Error finding Favorite for favoritingUserId ${favoritingUserId} and favoritedUserId ${favoritedUserId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllFavoritedByUserId(userId: string): Promise<Favorite[]> {
    try {
      return await this.favoriteRepository.find({
        where: { favorited_user: { user_id: userId } },
      });
    } catch (error) {
      throw new HttpException(
        `Error fetching all users who favorited user with ID ${userId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
