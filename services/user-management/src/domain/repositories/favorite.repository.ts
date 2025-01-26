import { Favorite } from '../entities/favorite.entity';
import { FavoriteID } from '../value-objects/favorite-id.value-object';

export interface IFavoriteRepository {
    create(favorite: Favorite): Promise<Favorite>;
    findAllByUserId(userId: string): Promise<Favorite[]>;
    delete(id: string): Promise<void>;
    findByFavoritingAndFavorited(favoritingUserId: string, favoritedUserId: string): Promise<Favorite | null>;
    findAllFavoritedByUserId(userId: string): Promise<Favorite[]>; 
}
