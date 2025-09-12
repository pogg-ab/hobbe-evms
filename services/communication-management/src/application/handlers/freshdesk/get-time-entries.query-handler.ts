import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTimeEntriesQuery } from 'src/application/queries/freshdesk/get-time-entries.query';
import { TimeEntryService } from 'src/application/services/freshdesk/time-entry.service';
import { TimeEntryResponseDto } from 'src/presentation/dto/freshdesk/time-entry/time-entry.dto';

@QueryHandler(GetTimeEntriesQuery)
export class GetTimeEntriesQueryHandler implements IQueryHandler<GetTimeEntriesQuery> {
    constructor(private readonly timeEntryService: TimeEntryService) { }

    async execute(query: GetTimeEntriesQuery): Promise<TimeEntryResponseDto[]> {
        const { ticketId } = query;
        return this.timeEntryService.findTimeEntriesByTicketId(ticketId);
    }
}