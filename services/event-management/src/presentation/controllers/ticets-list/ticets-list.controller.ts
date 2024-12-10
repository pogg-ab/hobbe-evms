import {  Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetAllTicketsListCommand } from 'src/application/queries/tickets/get-all-ticketslist.command';
import { TicketsList } from 'src/domain/entities/tickets_list.entity';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';


@Controller('tickets-list')
@ApiTags('Tickets-List')
export class TicketsListController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus:QueryBus
    ){}

    // @ApiBody({type: CreateTicketsListDto})
    // @ApiOperation({description:'Create Tickets List'})
    // @HttpCode(200)
    // @ApiResponse({ type:CreateTicketsListDto})
    // @Post(":ticket_id")
    // async createTickets(@Body() createTicketsListDto:CreateTicketsListDto):Promise<TicketsList>{
    //     const command = new CreateTicketsListCommand(createTicketsListDto);
    //     const createTicket = await this.commandBus.execute(command);
    //     return createTicket;
    // }

    @ApiOperation({ description: 'Get All Tickets In Single Ticket-Heading' })
    @ApiParam({
      name: 'ticket_id',
      description: 'The unique ID of the ticket',
      required: true,
      type: String, // Or 'Number' based on the ID type
    })
    @HttpCode(200)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get(':id')
    async getAll(@Param('id') ticket_id: IdValueObject): Promise<TicketsList[] | null> {
      return this.queryBus.execute(new GetAllTicketsListCommand(ticket_id));
    }

}
