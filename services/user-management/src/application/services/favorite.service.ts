import { Injectable, Inject } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Favorite } from 'src/domain/entities/favorite.entity';
import { IFavoriteRepository } from 'src/domain/repositories/favorite.repository';
import { FAVORITE_REPOSITORY_TOKEN } from 'src/domain/repositories/favorite.repository.token';
import { CreateFavoriteDto } from 'src/presentation/dtos/create-favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @Inject(FAVORITE_REPOSITORY_TOKEN)
    private readonly favoriteRepository: IFavoriteRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async addFavorite(createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
    const favorite = this.mapper.map(createFavoriteDto, CreateFavoriteDto, Favorite);
    return this.favoriteRepository.addFavorite(favorite);
  }

  async removeFavorite(createFavoriteDto: CreateFavoriteDto): Promise<void> {
    const favorite = this.mapper.map(createFavoriteDto, CreateFavoriteDto, Favorite);
    return this.favoriteRepository.removeFavorite(favorite);
  }

  async getFavorites(userId: string): Promise<CreateFavoriteDto[]> {
    const favorites = await this.favoriteRepository.findFavoritesByUserId(userId);
    return this.mapper.mapArray(favorites, Favorite, CreateFavoriteDto);
  }

  async getFavoritedBy(userId: string): Promise<CreateFavoriteDto[]> {
    const favoritedBy = await this.favoriteRepository.findUsersWhoFavorited(userId);
    return this.mapper.mapArray(favoritedBy, Favorite, CreateFavoriteDto);
  }
}