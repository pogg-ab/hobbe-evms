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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeleteSpecialGuestCommand } from 'src/application/commands/special-guest/delete-special-guest.command';
import { SpecialGuestCommand } from 'src/application/commands/special-guest/special-guest.command';
import { UpdatedSpecialGuestCommand } from 'src/application/commands/special-guest/update-special-guest.command';
import { GetAllSpecialGuests } from 'src/application/queries/special-guest/find-all-special-guests.query';
import { SpecialGuestFindById } from 'src/application/queries/special-guest/find-special-guest-by-id.query';
import { FindSpecialGuestsByEventIdQuery } from 'src/application/queries/special-guest/find-special-guests-by-event-id.query';
import { SpecialGuest } from 'src/domain/entities/special-guest.entity';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { CreateSpecialGuestDto } from 'src/presentation/dtos/special-guest/create-special-guest.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@ApiTags('Special Guests')
@Controller('special-guests')
export class SpecialGuestController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @ApiBody({ type: CreateSpecialGuestDto })
  @ApiOperation({ description: 'Create a new Special Guest' })
  @HttpCode(200)
  @Post()
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Body() createSpecialGuestDto: CreateSpecialGuestDto,
    @CurrentUserId() user: any,
  ): Promise<SpecialGuest> {
    const command = new SpecialGuestCommand(createSpecialGuestDto, user.user.user_id.toString());
    return await this.commandBus.execute(command);
  }

  @ApiOperation({ description: 'Get All Special Guests' })
  @HttpCode(200)
  @Get()
  async findAll() {
    const query = new GetAllSpecialGuests();
    return await this.queryBus.execute(query);
  }

  @ApiOperation({ description: 'Find Special Guest By ID' })
  @HttpCode(200)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const query = new SpecialGuestFindById(id);
    return await this.queryBus.execute(query);
  }

  @ApiOperation({ description: 'Get Special Guests by Event ID' })
  @HttpCode(200)
  @Get('event/:eventId')
  async findByEventId(@Param('eventId') eventId: string) {
    const query = new FindSpecialGuestsByEventIdQuery(eventId);
    return await this.queryBus.execute(query);
  }

  @ApiOperation({ description: 'Update Special Guest' })
  @ApiBody({ type: CreateSpecialGuestDto })
  @HttpCode(200)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() createSpecialGuestDto: CreateSpecialGuestDto,
  ) {
    const specialGuest = await this.queryBus.execute(
      new SpecialGuestFindById(id),
    );
    if (!specialGuest) {
      return 'Special Guest Not Found';
    }
    Object.assign(specialGuest, createSpecialGuestDto);
    return await this.commandBus.execute(
      new UpdatedSpecialGuestCommand(id, specialGuest),
    );
  }

  @ApiOperation({ description: 'Delete Special Guest' })
  @HttpCode(200)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const specialGuest = await this.queryBus.execute(
      new SpecialGuestFindById(id),
    );
    if (!specialGuest) {
      return 'Special Guest Not Found';
    }
    return await this.commandBus.execute(new DeleteSpecialGuestCommand(id));
  }
}
