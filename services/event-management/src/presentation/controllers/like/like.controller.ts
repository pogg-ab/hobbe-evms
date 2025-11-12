import { Controller, HttpCode, Param, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { LikeEventCommand } from "src/application/commands/like/like-event.command";
import { CurrentUserId } from "src/presentation/decorators/currentUserId.decorater";
import { Roles } from "src/presentation/decorators/roles.decorator";
import { JwtAuthGuard } from "src/presentation/guards/jwt-auth.guard";
import { RolesGuard } from "src/presentation/guards/roles.guard";
import { AuditLogInterceptor } from "src/presentation/interceptors/audit-log.interceptor";
import { AuditLog } from "src/presentation/decorators/audit-log.decorator";
import { ActionType } from "src/domain/entities/audit-log.entity";

@ApiTags("Likes")
@Controller("like")
@UseInterceptors(AuditLogInterceptor) // <-- APPLY INTERCEPTOR TO THE CONTROLLER
export class LikeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ description: 'Like/Unlike an Event' }) // Changed description for clarity
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(":event_id")
  @AuditLog({ 
    actionType: ActionType.LIKE_EVENT, // The action covers both like/unlike
    targetEntity: 'Event' 
  })
  async create(@Param('event_id') event_id: string, @CurrentUserId() user: any): Promise<{ message: string }> {
    const command = new LikeEventCommand(user.user.user_id.toString(), event_id);
    return await this.commandBus.execute(command);
  }
}