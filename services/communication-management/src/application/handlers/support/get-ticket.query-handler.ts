import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTicketQuery } from 'src/application/queries/support/get-ticket.query';
import { TicketService } from 'src/application/services/support/ticket.service';
import { TicketResponseDto } from 'src/presentation/dto/support/ticket/ticket.dto';
@QueryHandler(GetTicketQuery)
export class GetTicketQueryHandler implements IQueryHandler<GetTicketQuery> {
    constructor(private readonly ticketService: TicketService) { }

    async execute(query: GetTicketQuery): Promise<TicketResponseDto> {
        const { id } = query;
        return this.ticketService.findTicketById(id);
    }
}