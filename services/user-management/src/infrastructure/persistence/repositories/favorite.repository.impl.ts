import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from 'src/domain/entities/favorite.entity';
import { User } from 'src/domain/entities/user.entity';
import { IFavoriteRepository } from 'src/domain/repositories/favorite.repository';

@Injectable()
export class FavoriteRepository implements IFavoriteRepository {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Add a favorite to the database
  async addFavorite(favorite: Favorite): Promise<Favorite> {
    const { user, favoriteUser } = favorite;

    const existingUser = await this.userRepository.findOne({
      where: { user_id: user.user_id },
    });

    const existingFavoriteUser = await this.userRepository.findOne({
      where: { user_id: favoriteUser.user_id },
    });

    if (!existingUser || !existingFavoriteUser) {
      throw new Error('Invalid user or favorite user ID.');
    }

    const newFavorite = this.favoriteRepository.create({
      user: existingUser,
      favoriteUser: existingFavoriteUser,
      createdAt: new Date(),
    });

    return this.favoriteRepository.save(newFavorite);
  }

  // Remove a favorite from the database
  async removeFavorite(favorite: Favorite): Promise<void> {
    await this.favoriteRepository.delete({
      user: { user_id: favorite.user.user_id },
      favoriteUser: { user_id: favorite.favoriteUser.user_id },
    });
  }

  // Get the list of favorites for a user
  async findFavoritesByUserId(userId: string): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { user: { user_id: userId } },
      relations: ['favoriteUser'],
    });
  }

  // Get users who favorited a specific user
  async findUsersWhoFavorited(userId: string): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { favoriteUser: { user_id: userId } },
      relations: ['user'],
    });
  }
}
