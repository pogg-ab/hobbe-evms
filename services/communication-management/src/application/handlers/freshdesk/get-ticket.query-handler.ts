import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTicketQuery } from 'src/application/queries/freshdesk/get-ticket.query';
import { TicketService } from 'src/application/services/freshdesk/ticket.service';
import { TicketResponseDto } from 'src/presentation/dto/freshdesk/ticket/ticket.dto';
@QueryHandler(GetTicketQuery)
export class GetTicketQueryHandler implements IQueryHandler<GetTicketQuery> {
    constructor(private readonly ticketService: TicketService) { }

    async execute(query: GetTicketQuery): Promise<TicketResponseDto> {
        const { id } = query;
        return this.ticketService.findTicketById(id);
    }
}