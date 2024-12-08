import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiBody, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { CreateTicketsCommand } from "src/application/commands/ticket/create-tickets.command";
import { Tickets } from "src/domain/entities/tickets.entity";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";
import { CreateTicketsDto } from "src/presentation/dtos/tickets/create-tickets.dto";
import { JwtAuthGuard } from "src/presentation/guards/jwt-auth.guard";
import { RolesGuard } from "src/presentation/guards/roles.guard";



@Controller('tickets')
@ApiTags('tickets')
export class TicketsController{
    constructor(
        private readonly commandBus:CommandBus,
        private readonly queryBus:QueryBus,
    ){}
    @ApiOperation({ description: "Get All Tickets" })
    // @ApiParam()
    @HttpCode(200)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    getAll(){
        // Retrieve all tickets from the database
    }
    // @ApiOperation({ description: "Create Tickets For Event " })
    // @ApiParam({name:"Event_ID", description:"The event unique to create tickets"})
    // @ApiBody({type:CreateTicketsDto})
    // @HttpCode(200)
    // // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Post(":event_id")
    // async create(@Body() createTicketsDto:CreateTicketsDto, @Param('event_id') event_id:string):Promise<{ticket:Tickets,message:string}>{
    //       console.log(new IdValueObject(event_id));

    //     // Create a new ticket
    //     const command = new CreateTicketsCommand(new IdValueObject(event_id), createTicketsDto);
    //     const newTicket = await this.commandBus.execute(command);
    //     return {ticket:newTicket, message:"Create tickets successfully"};
    // }

    updateTickets(){
        // Update an existing ticket
    }


    deleteTickets(){
        // Delete a ticket
    }


    getTicketById(){
        // Retrieve a specific ticket by ID
    }


    getAllTicketsInSingleTicketHeading(){
        // Retrieve all tickets in a single ticket heading
    }


}