import { CreateFavoriteDto } from 'src/presentation/dtos/create-favorite.dto';
import { Favorite } from '../entities/favorite.entity';

export interface IFavoriteRepository {
  addFavorite(favorite: Favorite): Promise<Favorite>;
  removeFavorite(favorite: Favorite): Promise<void>;
  findFavoritesByUserId(userId: string): Promise<Favorite[]>;
  findUsersWhoFavorited(userId: string): Promise<Favorite[]>;
}
