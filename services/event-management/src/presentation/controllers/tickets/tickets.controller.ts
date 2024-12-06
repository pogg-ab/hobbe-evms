import {  Controller, Delete, Get, HttpCode, Param, Patch } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetAllTicketsListCommand } from 'src/application/queries/tickets/get-all-ticketslist.command';
import { TicketsList } from 'src/domain/entities/tickets_list.entity';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';


@Controller('TicketsList')
@ApiTags('TicketsList')
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

    @ApiOperation({description:'Get All Tickets In Single Ticket-Heading'})
    @HttpCode(200)
    @Get(":ticket_id")
    async getAll(@Param('ticket_id') ticket_id:IdValueObject): Promise<TicketsList[] | null>{
        return this.queryBus.execute(new GetAllTicketsListCommand(ticket_id))
    }



    
    @ApiOperation({description:'Get Single Tickets'})
    @HttpCode(200)
    @Get(":id")
    async findOne(@Param("ID") ticket_id:IdValueObject): Promise<TicketsList>{
        return this.queryBus.execute(new GetAllTicketsListCommand(ticket_id))
    }



    @ApiOperation({description:'Get Single Tickets'})
    @HttpCode(200)
    @Patch(":id")
    async updateTicket(id:string): Promise<TicketsList>{
        return
    }

    @ApiOperation({description:'Get Single Tickets'})
    @HttpCode(200)
    @Delete(":id")
    async removeTicket(id:string): Promise<TicketsList>{
        return
    }


}
