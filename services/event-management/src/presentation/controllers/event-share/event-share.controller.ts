import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { RolesGuard } from 'src/presentation/guards/roles.guard';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { ShareEventDto } from 'src/presentation/dtos/share-event/share-event.dto';
import { CreateShareEventCommand } from 'src/application/commands/event-sharing/create-share-event.command';

@ApiTags('Event-Share')
@Controller('event-share')
export class EventShareController {
  constructor(private readonly commandBus: CommandBus) { }

  @ApiOperation({ description: 'Share an event with other users' })
  @ApiBody({ type: ShareEventDto })
  @HttpCode(200)
  @Post()
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async shareEvent(
    @Body() shareEventDto: ShareEventDto,
    @CurrentUserId() user: any,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(
      new CreateShareEventCommand(user.user.user_id.toString(), shareEventDto),
    );
    return { message: 'Event shared successfully' };
  }
}
