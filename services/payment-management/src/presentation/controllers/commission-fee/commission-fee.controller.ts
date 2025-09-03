import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Permissions } from 'src/presentation/decorators/permissions.decorator';
import { UniversalAuthGuard } from 'src/presentation/guards/universal-auth.guard';
import { PermissionsGuard } from 'src/presentation/guards/permissions.guard';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import {
  CreateCommissionFeeDto,
  UpdateCommissionFeeDto,
} from 'src/presentation/dtos/commission-fee/commission-fee.dto';
import { CreateCommissionFeeCommand } from 'src/application/commands/commission-fee/create-commission-fee.command';
import { UpdateCommissionFeeCommand } from 'src/application/commands/commission-fee/update-commission-fee.command';
import { DeleteCommissionFeeCommand } from 'src/application/commands/commission-fee/delete-commission-fee.command';
import { GetCommissionFeeByIdQuery } from 'src/application/queries/commission-fee/get-commission-fee-by-id.query';
import { GetAllCommissionFeesQuery } from 'src/application/queries/commission-fee/get-all-commission-fees.query';
import { CommissionFee } from 'src/domain/entities/commission-fee.entity';
import { CommissionFeeIdValueObject } from 'src/domain/value-objects/commission-fee-id.value-object';

@ApiTags('Commission Fees')
@Controller('commission-fees')
export class CommissionFeeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ description: 'Create a new commission fee record' })
  @HttpCode(201)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Commission fee record created successfully',
    type: CommissionFee,
  })
  @ApiBody({ type: CreateCommissionFeeDto })
  @Permissions('manage:CommissionFee')
  @UseGuards(UniversalAuthGuard, PermissionsGuard)
  @Post()
  async createCommissionFee(
    @Body() createCommissionFeeDto: CreateCommissionFeeDto,
    @CurrentUserId() user: any,
  ): Promise<CommissionFee> {
    const userId = user.userId;
    return await this.commandBus.execute(
      new CreateCommissionFeeCommand(createCommissionFeeDto, userId),
    );
  }

  @ApiOperation({ description: 'Get a commission fee record by ID' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Commission fee record retrieved successfully',
    type: CommissionFee,
  })
  @Permissions('manage:CommissionFee')
  @UseGuards(UniversalAuthGuard, PermissionsGuard)
  @Get(':id')
  async getCommissionFeeById(@Param('id') id: string): Promise<CommissionFee> {
    const commissionFeeId = new CommissionFeeIdValueObject(id);
    return await this.queryBus.execute(
      new GetCommissionFeeByIdQuery(commissionFeeId),
    );
  }

  @ApiOperation({
    description: 'Get all commission fee records with pagination',
  })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Commission fee records retrieved successfully',
  })
  @Permissions('manage:CommissionFee')
  @UseGuards(UniversalAuthGuard, PermissionsGuard)
  @Get()
  async getAllCommissionFees(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    commissionFees: CommissionFee[] | null;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.queryBus.execute(
      new GetAllCommissionFeesQuery(page, limit),
    );
  }

  @ApiOperation({ description: 'Update a commission fee record' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Commission fee record updated successfully',
    type: CommissionFee,
  })
  @ApiBody({ type: UpdateCommissionFeeDto })
  @Permissions('manage:CommissionFee')
  @UseGuards(UniversalAuthGuard, PermissionsGuard)
  @Patch(':id')
  async updateCommissionFee(
    @Param('id') id: string,
    @Body() updateCommissionFeeDto: UpdateCommissionFeeDto,
    @CurrentUserId() user: any,
  ): Promise<CommissionFee> {
    const userId = user.userId;
    const commissionFeeId = new CommissionFeeIdValueObject(id);
    return await this.commandBus.execute(
      new UpdateCommissionFeeCommand(
        commissionFeeId,
        updateCommissionFeeDto,
        userId,
      ),
    );
  }

  @ApiOperation({ description: 'Delete a commission fee record' })
  @HttpCode(204)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Commission fee record deleted successfully',
  })
  @Permissions('manage:CommissionFee')
  @UseGuards(UniversalAuthGuard, PermissionsGuard)
  @Delete(':id')
  async deleteCommissionFee(
    @Param('id') id: string,
    @CurrentUserId() user: any,
  ): Promise<void> {
    const userId = user.userId;
    const commissionFeeId = new CommissionFeeIdValueObject(id);
    await this.commandBus.execute(
      new DeleteCommissionFeeCommand(commissionFeeId, userId),
    );
  }
}
