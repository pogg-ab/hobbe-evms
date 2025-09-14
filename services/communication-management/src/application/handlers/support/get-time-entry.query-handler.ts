import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTimeEntryQuery } from 'src/application/queries/support/get-time-entry.query';
import { TimeEntryService } from 'src/application/services/support/time-entry.service';
import { TimeEntryResponseDto } from 'src/presentation/dto/support/time-entry/time-entry.dto';

@QueryHandler(GetTimeEntryQuery)
export class GetTimeEntryQueryHandler implements IQueryHandler<GetTimeEntryQuery> {
    constructor(private readonly timeEntryService: TimeEntryService) { }

    async execute(query: GetTimeEntryQuery): Promise<TimeEntryResponseDto> {
        const { id } = query;
        return this.timeEntryService.findTimeEntryById(id);
    }
}