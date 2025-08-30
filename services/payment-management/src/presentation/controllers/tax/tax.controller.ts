import { Controller, Post, Get, Patch, Delete, Body, Param, Query, HttpCode, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Permissions } from 'src/presentation/decorators/permissions.decorator';
import { UniversalAuthGuard } from 'src/presentation/guards/universal-auth.guard';
import { PermissionsGuard } from 'src/presentation/guards/permissions.guard';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { CreateTaxDto, UpdateTaxDto } from 'src/presentation/dtos/tax/tax.dto';
import { CreateTaxCommand } from 'src/application/commands/tax/create-tax.command';
import { UpdateTaxCommand } from 'src/application/commands/tax/update-tax.command';
import { DeleteTaxCommand } from 'src/application/commands/tax/delete-tax.command';
import { GetTaxByIdQuery } from 'src/application/queries/tax/get-tax-by-id.query';
import { GetAllTaxesQuery } from 'src/application/queries/tax/get-all-taxes.query';
import { Tax } from 'src/domain/entities/tax.entity';

@ApiTags('Tax')
@Controller('tax')
export class TaxController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @ApiOperation({ description: 'Create a new tax record' })
    @HttpCode(201)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Tax record created successfully',
        type: Tax,
    })
    @ApiBody({ type: CreateTaxDto })
    @Permissions('manage:Tax')
    @UseGuards(UniversalAuthGuard, PermissionsGuard)
    @Post()
    async createTax(
        @Body() createTaxDto: CreateTaxDto,
        @CurrentUserId() user: any,
    ): Promise<Tax> {
        const userId = user.user.user_id.toString();
        return await this.commandBus.execute(
            new CreateTaxCommand(createTaxDto, userId),
        );
    }

    @ApiOperation({ description: 'Get a tax record by ID' })
    @HttpCode(200)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Tax record retrieved successfully',
        type: Tax,
    })
    @Permissions('manage:Tax')
    @UseGuards(UniversalAuthGuard, PermissionsGuard)
    @Get(':id')
    async getTaxById(@Param('id') taxId: string): Promise<Tax> {
        return await this.queryBus.execute(new GetTaxByIdQuery(taxId));
    }

    @ApiOperation({ description: 'Get all tax records with pagination' })
    @HttpCode(200)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Tax records retrieved successfully',
    })
    @Permissions('manage:Tax')
    @UseGuards(UniversalAuthGuard, PermissionsGuard)
    @Get()
    async getAllTaxes(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<{ taxes: Tax[] | null; total: number; page: number; limit: number; totalPages: number }> {
        return await this.queryBus.execute(new GetAllTaxesQuery(page, limit));
    }

    @ApiOperation({ description: 'Update a tax record' })
    @HttpCode(200)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Tax record updated successfully',
        type: Tax,
    })
    @ApiBody({ type: UpdateTaxDto })
    @Permissions('manage:Tax')
    @UseGuards(UniversalAuthGuard, PermissionsGuard)
    @Patch(':id')
    async updateTax(
        @Param('id') taxId: string,
        @Body() updateTaxDto: UpdateTaxDto,
        @CurrentUserId() user: any,
    ): Promise<Tax> {
        const userId = user.user.user_id.toString();
        return await this.commandBus.execute(
            new UpdateTaxCommand(taxId, updateTaxDto, userId),
        );
    }

    @ApiOperation({ description: 'Delete a tax record' })
    @HttpCode(204)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Tax record deleted successfully',
    })
    @Permissions('manage:Tax')
    @UseGuards(UniversalAuthGuard, PermissionsGuard)
    @Delete(':id')
    async deleteTax(
        @Param('id') taxId: string,
        @CurrentUserId() user: any,
    ): Promise<void> {
        const userId = user.user.user_id.toString();
        await this.commandBus.execute(new DeleteTaxCommand(taxId, userId));
    }
}