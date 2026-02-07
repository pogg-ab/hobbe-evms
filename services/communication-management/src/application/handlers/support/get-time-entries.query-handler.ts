import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTimeEntriesQuery } from 'src/application/queries/support/get-time-entries.query';
import { TimeEntryService } from 'src/application/services/support/time-entry.service';
import { TimeEntryResponseDto } from 'src/presentation/dto/support/time-entry/time-entry.dto';

@QueryHandler(GetTimeEntriesQuery)
export class GetTimeEntriesQueryHandler implements IQueryHandler<GetTimeEntriesQuery> {
    constructor(private readonly timeEntryService: TimeEntryService) { }

    async execute(query: GetTimeEntriesQuery): Promise<TimeEntryResponseDto[]> {
        const { ticketId } = query;
        return this.timeEntryService.findTimeEntriesByTicketId(ticketId);
    }
}