

import {  Controller,  HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { LikeEventCommand } from "src/application/commands/like/like-event.command";
import { CurrentUserId } from "src/presentation/decorators/currentUserId.decorater";
import { Roles } from "src/presentation/decorators/roles.decorator";
import { JwtAuthGuard } from "src/presentation/guards/jwt-auth.guard";
import { RolesGuard } from "src/presentation/guards/roles.guard";



@ApiTags("Likes")
@Controller("like")
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