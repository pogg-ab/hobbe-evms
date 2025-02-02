

import { Controller, Get, HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { FavoriteEventCommand } from "src/application/commands/favorite/favorite-event.command";
import { LikeEventCommand } from "src/application/commands/like/like-event.command";
import { FindEventsByUsersFavoriteQuery } from "src/application/queries/favorite/find-events-by-users-favorite.query";
import { FavoriteEvent } from "src/domain/entities/favorite-event.entity";
import { CurrentUserId } from "src/presentation/decorators/currentUserId.decorater";
import { Roles } from "src/presentation/decorators/roles.decorator";
import { JwtAuthGuard } from "src/presentation/guards/jwt-auth.guard";
import { RolesGuard } from "src/presentation/guards/roles.guard";



@ApiTags("Favorite")
@Controller("favorite")
export class FavoriteController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @ApiOperation({ description: 'Get Users Favorite Events' })
  @HttpCode(200)
  @Get('events')
  async findByUsersFavorite(
    @CurrentUserId() user: any,
  ): Promise<FavoriteEvent[] | null> {
    return this.queryBus.execute(new FindEventsByUsersFavoriteQuery(user));
  }

  // Create a new category
  @ApiOperation({ description: 'Favorite Event' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(":event_id")
  async create(
    @Param('event_id') event_id: string,
    @CurrentUserId() user: any
  ): Promise<{ message: string }> {
    const command = new FavoriteEventCommand(user.user.user_id.toString(), event_id);
    return await this.commandBus.execute(command);
  }


}