import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePromocodeCommand } from 'src/application/commands/promocodes/create-promocode.command';
import { UpdatePromocodeCommand } from 'src/application/commands/promocodes/updaet-promocode.command';
import { FindOnePoromocodeQuery } from 'src/application/queries/promocodes/find-one-promocode.query';
import { Promocodes } from 'src/domain/entities/promocodes.entity';
import { CreatePromocodeDto } from 'src/presentation/dtos/tickets/create-promocode.dto';
import { UpdatePromocodeDto } from 'src/presentation/dtos/tickets/update.promocode.dto';

@ApiTags('Promocode')
@Controller('promocode')
export class PromocodeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiBody({ type: CreatePromocodeDto })
  @ApiOperation({ description: 'Create a new PromoCode' })
  @HttpCode(200)
  @ApiResponse({
    type: CreatePromocodeDto,
  })
  @Post()
  //   @Roles('User')
  //   @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Body() createPromocodeDto: CreatePromocodeDto,
  ): Promise<{ message: string; promocode: Promocodes }> {
    const command = new CreatePromocodeCommand(createPromocodeDto);
    const promocode = await this.commandBus.execute(command);
    return { message: 'Promocode created successfully', promocode: promocode };
  }

  @ApiOperation({ description: 'Find Promocode ID' })
  // @ApiParam()
  @HttpCode(200)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.queryBus.execute(new FindOnePoromocodeQuery(id));
  }

  @ApiOperation({ description: 'Update Promocode' })
  // @ApiParam({type : CreateTicketsHeadingDto})
  @HttpCode(200)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePromocodeDto: UpdatePromocodeDto,
  ): Promise<Promocodes> {
    const promocode = await this.queryBus.execute(
      new FindOnePoromocodeQuery(id),
    );
    if (!promocode) throw new Error('Promocode not found');
    Object.assign(promocode, updatePromocodeDto);
    return this.commandBus.execute(new UpdatePromocodeCommand(id, promocode));
  }
}
