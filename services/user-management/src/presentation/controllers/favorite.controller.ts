import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AddFavoriteCommand } from 'src/application/commands/favorite/add-favorite.command';
import { RemoveFavoriteCommand } from 'src/application/commands/favorite/remove-favorite.command';
import { GetFavoritedByQuery } from 'src/application/queries/favorite/get-favorited-by.query';
import { GetFavoritesQuery } from 'src/application/queries/favorite/get-favorites.query';
import { CreateFavoriteDto } from '../dtos/create-favorite.dto';
import { Favorite } from 'src/domain/entities/favorite.entity';

@ApiTags('Favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) { }

 
  @ApiOperation({ description: 'Add a user to favorites' })
  @ApiResponse({
    type: CreateFavoriteDto,
  })
  @HttpCode(200)
  @Post()
  async addFavorite(
    @Body() createFavoriteDto: CreateFavoriteDto,
  ): Promise<{ message: string; favorite: Favorite }> {
     const favorite = await this.commandBus.execute(new AddFavoriteCommand(createFavoriteDto));
    return {  message: 'User has been added to favorites.', favorite: favorite };
  }


  @ApiOperation({ description: 'Remove a user from favorites' })
  @HttpCode(200)
  @Delete()
  async removeFavorite(
    @Body() createFavoriteDto: CreateFavoriteDto): Promise<void> {
    await this.commandBus.execute(new RemoveFavoriteCommand(createFavoriteDto));
  }


  @ApiOperation({ description: 'Get all favorite users for a given user' })
  @HttpCode(200)
  @Get(':userId')
  async getFavorites(@Param('userId') userId: string): Promise<CreateFavoriteDto[]> {
    return await this.queryBus.execute(new GetFavoritesQuery(userId));
  }


  @ApiOperation({ description: 'Get all users who favorited the given user' })
  @HttpCode(200)
  @Get('favorited-by/:userId')
  async getFavoritedBy(@Param('userId') userId: string): Promise<CreateFavoriteDto[]> {
    return await this.queryBus.execute(new GetFavoritedByQuery(userId));
  }
}
