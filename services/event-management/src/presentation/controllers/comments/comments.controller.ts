import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCommentsCommand } from 'src/application/commands/comments/create-comments.command';
import { RemoveCommentsCommand } from 'src/application/commands/comments/remove-comments.command';
import { UpdateCommentsCommand } from 'src/application/commands/comments/update-comments.command';
import { LikeEventCommand } from 'src/application/commands/like/like-event.command';
import { FindByEventCommentsQuery } from 'src/application/queries/commnets/find-by-event-comments.query';
import { FindOneCommentsQuery } from 'src/application/queries/commnets/find-one-comments.query';
import { Comments } from 'src/domain/entities/comments.entity';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { CommentsDto } from 'src/presentation/dtos/comments/comments.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@ApiTags('Comments')
@Controller('Comments')
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @ApiOperation({ description: 'Drop Your Comment On Event' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(
    @Body() commentsDto: CommentsDto,
    @CurrentUserId() user: any,
  ): Promise<Comments> {
    const comment = new CreateCommentsCommand(user.user.user_id.toString(), commentsDto);
    return await this.commandBus.execute(comment);
  }

  @ApiOperation({ description: 'All Comments Per Event' })
  @HttpCode(200)

  @Get('/event/:event_id')
  async findByEvent(@Param('event_id') event_id: string): Promise<Comments[]> {
    return await this.queryBus.execute(new FindByEventCommentsQuery(event_id));
  }

  @ApiOperation({ description: 'Get Single Comment' })
  @HttpCode(200)
  // @Roles('User')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':comment_id')
  async findOne(
    @Param('comment_id') comment_id: string,
    // @CurrentUserId() user: any,
  ): Promise<Comments | null> {
    return await this.queryBus.execute(new FindOneCommentsQuery(comment_id));
  }

  @ApiOperation({ description: 'Update Comment' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':comment_id')
  async update(
    @Body() commentsDto: CommentsDto,
    @Param('comment_id') comment_id: string,
  ): Promise<Comments> {
    const comment = new UpdateCommentsCommand(comment_id, commentsDto);
    return await this.commandBus.execute(comment);
  }

  @ApiOperation({ description: 'Update Comment' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':comment_id')
  async dalete(
    @Param('comment_id') comment_id: string,
  ): Promise<{ message: string }> {
    const command = new RemoveCommentsCommand(comment_id);
    await this.commandBus.execute(command);
    return { message: 'Comment Deleted' };
  }


}
