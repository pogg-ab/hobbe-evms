import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';

@Controller('tickets')
@ApiTags('Tickets')
export class TicketsController {

    @ApiBody({type: CreateTicketsDto})
    @ApiOperation({description:'Create Tickets'})
    @HttpCode(200)
    @ApiResponse({ type:CreateTicketsDto})
    @Post()
    async createTickets(@Body() createTicketsDto:CreateTicketsDto): Promise<any>{
        return 'Hello from Ticket';
    }

    @ApiOperation({description:'Get All Tickets'})
    @HttpCode(200)
    @Get()
    async getAll(): Promise<any>{
        return 'Hello from Ticket';
    }
}
