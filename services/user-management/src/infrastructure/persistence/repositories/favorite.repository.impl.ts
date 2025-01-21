import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from 'src/domain/entities/favorite.entity';
import { User } from 'src/domain/entities/user.entity';
import { IFavoriteRepository } from 'src/domain/repositories/favorite.repository';
import { Repository } from 'typeorm';

@Injectable()
export class FavoriteRepository implements IFavoriteRepository {
  constructor(
    @InjectRepository(Favorite) private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  // Add a favorite to the database
  async addFavorite(userId: string, favoriteUserId: string): Promise<Favorite> {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    const favoriteUser = await this.userRepository.findOne({ where: { user_id: favoriteUserId } });

    if (!user || !favoriteUser) {
      throw new Error('Invalid user or favorite user ID.');
    }

    const favorite = this.favoriteRepository.create({ user, favoriteUser });
    return await this.favoriteRepository.save(favorite);
  }

  // Remove a favorite from the database
  async removeFavorite(userId: string, favoriteUserId: string): Promise<void> {
    await this.favoriteRepository.delete({
      user: { user_id: userId },
      favoriteUser: { user_id: favoriteUserId },
    });
  }

  // Get the list of favorites for a user
  async getFavorites(userId: string): Promise<User[]> {
    const favorites = await this.favoriteRepository.find({
      where: { user: { user_id: userId } },
      relations: ['favoriteUser'],
    });

    return favorites.map((favorite) => favorite.favoriteUser);
  }

  // Get users who favorited a specific user
  async getFavoritedBy(userId: string): Promise<User[]> {
    const favoritedBy = await this.favoriteRepository.find({
      where: { favoriteUser: { user_id: userId } },
      relations: ['user'],
    });

    return favoritedBy.map((favorite) => favorite.user);
  }
}
