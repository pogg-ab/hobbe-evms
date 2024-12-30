

import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CategoriesCommand } from "src/application/commands/categories/categories.command";
import { DeleteCategoriesCommand } from "src/application/commands/categories/delete-categories.command";
import { UpdatedCategoryCommand } from "src/application/commands/categories/update-categories.command";
import { LikeEventCommand } from "src/application/commands/like/like-event.command";
import { GetAllCategories } from "src/application/queries/categories/find-all-categories";
import { CategoriesFindById } from "src/application/queries/categories/find-categories-by-id.query";
import { Categories } from "src/domain/entities/categories.entity";
import { Like } from "src/domain/entities/likes.entity";
import { CurrentUserId } from "src/presentation/decorators/currentUserId.decorater";
import { Roles } from "src/presentation/decorators/roles.decorator";
import { CreateCategoriesDto } from "src/presentation/dtos/categories/categories.dto";
import { JwtAuthGuard } from "src/presentation/guards/jwt-auth.guard";
import { RolesGuard } from "src/presentation/guards/roles.guard";



@ApiTags("Likes")
@Controller("Like")
export class LikeController{
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
      ) {}

    // Create a new category
    @ApiOperation({ description: 'Like Event' })
    @HttpCode(200)
    @Roles('User')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post(":event_id")
    async create(@Param('event_id') event_id:string,  @CurrentUserId() user: any):Promise<{message:string}>{
      const command = new LikeEventCommand(user.user.user_id.toString(), event_id);      
       return await this.commandBus.execute(command);
       
    }
}