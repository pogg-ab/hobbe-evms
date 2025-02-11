import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from 'src/domain/entities/favorite.entity';
import { User } from 'src/domain/entities/user.entity';
import { IFavoriteRepository } from 'src/domain/repositories/favorite.repository';
import { FAVORITE_REPOSITORY_TOKEN } from 'src/domain/repositories/favorite.repository.token';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { CreateFavoriteDto } from 'src/presentation/dtos/create-favorite.dto';
import { Repository } from 'typeorm';

@Injectable()
export class FavoriteService {
    constructor(
        @Inject(FAVORITE_REPOSITORY_TOKEN)
        private readonly favoriteRepository: IFavoriteRepository,
        @Inject(USER_REPOSITORY_TOKEN)
        private readonly userRepository: IUserRepository,
        @InjectMapper() private readonly mapper: Mapper,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) { }

    async create(createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
        const favoritingUser = await this.userRepository.findById(createFavoriteDto.favoriting_user_id.toString());
        if (!favoritingUser) {
            throw new NotFoundException(`User with ID ${createFavoriteDto.favoriting_user_id} does not exist`);
        }

        const favoritedUser = await this.userRepository.findById(createFavoriteDto.favorited_user_id.toString());
        if (!favoritedUser) {
            throw new NotFoundException(`User with ID ${createFavoriteDto.favorited_user_id} does not exist`);
        }

        if (createFavoriteDto.favoriting_user_id === createFavoriteDto.favorited_user_id) {
            throw new BadRequestException('A user cannot favorite themselves');
        }

        const existingFavorite = await this.favoriteRepository.findByFavoritingAndFavorited(createFavoriteDto.favoriting_user_id, createFavoriteDto.favorited_user_id);

        if (existingFavorite) {
            throw new ConflictException('Favorite relationship already exists between these users');
        }

        const newFavorite = await this.mapper.map(
            createFavoriteDto,
            CreateFavoriteDto,
            Favorite,
        );
        newFavorite.favoriting_user = await this.getUser(createFavoriteDto.favoriting_user_id);
        newFavorite.favorited_user = await this.getUser(createFavoriteDto.favorited_user_id);

        const savedFavorite = await this.favoriteRepository.create(newFavorite);
        return savedFavorite;
    }

    private async getUser(userId: string) {
        if (userId) {
            const user = await this.userRepo.findOne({ where: { user_id: userId } });
            return user;
        }
        return null;
    }

    async remove(favoritingUserId: string, favoritedUserId: string): Promise<void> {
        const favorite = await this.favoriteRepository.findByFavoritingAndFavorited(favoritingUserId, favoritedUserId);

        if (!favorite) {
            throw new NotFoundException('Favorite relationship not found');
        }

        await this.favoriteRepository.delete(favorite.favorite_id.toString());
    }

    async findUserFavorites(userId: string, page: number, limit: number,): Promise<{
        favoriteUsers: Favorite[] | null;
        total: number;
        page: number;
        limit: number;
    }> {
        return this.favoriteRepository.findAllByUserId(userId, page, limit,);
    }

    async findFavoritedBy(userId: string, page: number, limit: number,): Promise<{
        favoritedByUsers: Favorite[] | null;
        total: number;
        page: number;
        limit: number;
    }> {
        return this.favoriteRepository.findAllFavoritedByUserId(userId, page, limit,);
    }
}
