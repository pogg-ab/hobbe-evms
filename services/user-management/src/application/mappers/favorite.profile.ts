import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Favorite } from 'src/domain/entities/favorite.entity';
import { CreateFavoriteDto } from 'src/presentation/dtos/create-favorite.dto';
import { UserID } from 'src/domain/value-objects/user-id.value-object';

@Injectable()
export class FavoriteMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreateFavoriteDto,
        Favorite,
        forMember(
          (destination) => destination.user,
          mapFrom((src: CreateFavoriteDto) => ({
            user_id: new UserID(src.userId), // Converting userId to UserID
          })),
        ),
        forMember(
          (destination) => destination.favoriteUser,
          mapFrom((src: CreateFavoriteDto) => ({
            user_id: new UserID(src.favoriteUserId), // Converting favoriteUserId to UserID
          })),
        ),
        forMember(
          (destination) => destination.createdAt,
          mapFrom(() => new Date()),
        ),
      );

      createMap(
        mapper,
        Favorite,
        CreateFavoriteDto,
        forMember(
          (destination) => destination.userId,
          mapFrom((src: Favorite) => src.user.user_id.toString()), // Convert UserID to string
        ),
        forMember(
          (destination) => destination.favoriteUserId,
          mapFrom((src: Favorite) => src.favoriteUser.user_id.toString()), // Convert UserID to string
        ),
      );
    };
  }
}
