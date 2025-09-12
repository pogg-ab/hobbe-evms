import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAgentTimeEntriesQuery } from 'src/application/queries/freshdesk/get-agent-time-entries.query';
import { TimeEntryService } from 'src/application/services/freshdesk/time-entry.service';
import { TimeEntryResponseDto } from 'src/presentation/dto/freshdesk/time-entry/time-entry.dto';

@QueryHandler(GetAgentTimeEntriesQuery)
export class GetAgentTimeEntriesQueryHandler implements IQueryHandler<GetAgentTimeEntriesQuery> {
    constructor(private readonly timeEntryService: TimeEntryService) { }

    async execute(query: GetAgentTimeEntriesQuery): Promise<TimeEntryResponseDto[]> {
        const { agentId, startDate, endDate } = query;
        return this.timeEntryService.findTimeEntriesByAgentId(agentId, startDate, endDate);
    }
}