import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAgentTimeReportQuery } from 'src/application/queries/freshdesk/get-agent-time-report.query';
import { TimeEntryService } from 'src/application/services/freshdesk/time-entry.service';
import { AgentTimeReportResponseDto } from 'src/presentation/dto/freshdesk/agent/agent.dto';

@QueryHandler(GetAgentTimeReportQuery)
export class GetAgentTimeReportQueryHandler implements IQueryHandler<GetAgentTimeReportQuery> {
    constructor(private readonly timeEntryService: TimeEntryService) { }

    async execute(query: GetAgentTimeReportQuery): Promise<AgentTimeReportResponseDto> {
        const { agentId, startDate, endDate } = query;
        return this.timeEntryService.getAgentTimeReport(agentId, startDate, endDate);
    }
}