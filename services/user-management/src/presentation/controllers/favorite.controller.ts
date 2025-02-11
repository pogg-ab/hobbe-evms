import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Favorite } from 'src/domain/entities/favorite.entity';
import { CreateFavoriteDto } from '../dtos/create-favorite.dto';
import { CreateFavoriteCommand } from 'src/application/commands/favorite/add-favorite.command';
import { RemoveFavoriteCommand } from 'src/application/commands/favorite/remove-favorite.command';
import { FindUserFavoritesQuery } from 'src/application/queries/favorite/get-favorites.query';
import { FindFavoritedByQuery } from 'src/application/queries/favorite/get-favorited-by.query';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUserId } from '../decorators/currentUserId.decorater';

@ApiTags('Favorites')
@Controller('favorites')
export class FavoriteController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark a user as favorite' })
  @ApiBody({ type: CreateFavoriteDto })
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'Favorite relationship created successfully',
    type: Favorite,
  })
  async createFavorite(
    @Body() createFavoriteDto: CreateFavoriteDto,
  ): Promise<{ message: string; favorite: Favorite }> {
    const command = new CreateFavoriteCommand(createFavoriteDto);
    const favorite = await this.commandBus.execute(command);

    return {
      message: 'Favorite relationship created successfully',
      favorite,
    };
  }

  @Delete(':favoritingUserId/:favoritedUserId')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove a favorite relationship' })
  @ApiResponse({
    status: 200,
    description: 'Favorite relationship removed successfully',
  })
  async removeFavorite(
    @Param('favoritingUserId') favoritingUserId: string,
    @Param('favoritedUserId') favoritedUserId: string,
  ): Promise<{ message: string }> {
    const command = new RemoveFavoriteCommand(favoritingUserId, favoritedUserId);
    await this.commandBus.execute(command);

    return { message: 'Favorite relationship removed successfully' };
  }

  @Get('favorite-users')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all favorite users for a given user' })
  @ApiResponse({
    status: 200,
    description: 'List of all users favorited by the given user',
    type: [Favorite],
  })
  async findUserFavorites(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @CurrentUserId() currentUser: any):
    Promise<
      {
        favoriteUsers: Favorite[] | null;
        total: number;
        page: number;
        limit: number;
      }> {
    const userId = currentUser.user.user_id.toString()

    const { favoriteUsers, total } = await this.queryBus.execute(new FindUserFavoritesQuery(userId, page, limit));
    return {
      favoriteUsers,
      total,
      page,
      limit,
    };
  }

  @Get('favorited-by-user')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users who favorited a given user' })
  @ApiResponse({
    status: 200,
    description: 'List of all users who marked the given user as a favorite',
    type: [Favorite],
  })
  async findFavoritedBy(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @CurrentUserId() currentUser: any):
    Promise<
      {
        favoritedByUsers: Favorite[] | null;
        total: number;
        page: number;
        limit: number;
      }> {
    const userId = currentUser.user.user_id.toString()

    const { favoritedByUsers, total } = await this.queryBus.execute(new FindFavoritedByQuery(userId, page, limit));
    return {
      favoritedByUsers,
      total,
      page,
      limit,
    };
  }
}
