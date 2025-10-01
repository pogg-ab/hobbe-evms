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
  ) {}

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

  async findAllByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    favoriteUsers: Favorite[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      const favoriteUsers = await this.favoriteRepository.find({
        where: [{ favorited_user: { user_id: userId } }],
        relations: [
          'favoriting_user',
          'favoriting_user.personal_account',
          'favoriting_user.organizational_account',
        ],
        take: limit,
        skip: offset,
      });
      const total = await this.favoriteRepository.count({
        where: [{ favorited_user: { user_id: userId } }],
      });

      await Promise.all(
        favoriteUsers.map(async (favoriteUser) => {
          if (favoriteUser.favoriting_user) {
            this.removeSensitiveFields(favoriteUser.favoriting_user);
          }
        }),
      );
      return {
        favoriteUsers: favoriteUsers || null,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new HttpException(
        `Error fetching Favorites for user with ID ${userId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findAllFavoritedByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    favoritedByUsers: Favorite[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      const favoritedByUsers = await this.favoriteRepository.find({
        where: { favoriting_user: { user_id: userId } },
        relations: [
          'favorited_user',
          'favorited_user.personal_account',
          'favorited_user.organizational_account',
        ],
        take: limit,
        skip: offset,
      });
      const total = await this.favoriteRepository.count({
        where: [{ favoriting_user: { user_id: userId } }],
      });

      await Promise.all(
        favoritedByUsers.map(async (favoritedUser) => {
          if (favoritedUser.favorited_user) {
            this.removeSensitiveFields(favoritedUser.favorited_user);
          }
        }),
      );
      return {
        favoritedByUsers: favoritedByUsers || null,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new HttpException(
        `Error fetching all users who favorited user with ID ${userId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  private removeSensitiveFields(user: any): void {
    const fieldsToRemove = [
      'password',
      'password_reset_token',
      'password_reset_token_expiry',
      'password_reset_requested_at',
      'otp',
      'otp_expiry',
    ];

    fieldsToRemove.forEach((field) => {
      delete user[field];
    });
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
          {
            favoriting_user: { user_id: favoritingUserId },
            favorited_user: { user_id: favoritedUserId },
          },
          {
            favoriting_user: { user_id: favoritedUserId },
            favorited_user: { user_id: favoritingUserId },
          },
        ],
      });
    } catch (error) {
      throw new HttpException(
        `Error finding Favorite for favoritingUserId ${favoritingUserId} and favoritedUserId ${favoritedUserId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
