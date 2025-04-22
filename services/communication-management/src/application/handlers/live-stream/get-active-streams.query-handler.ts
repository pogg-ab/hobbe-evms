import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetActiveStreamsQuery } from 'src/application/queries/live-stream/get-active-streams.query';
import { StreamService } from 'src/application/services/live-stream/stream.service';

@QueryHandler(GetActiveStreamsQuery)
export class GetActiveStreamsHandler implements IQueryHandler<GetActiveStreamsQuery> {
    constructor(private readonly streamService: StreamService) { }

    async execute(query: GetActiveStreamsQuery): Promise<any> {
        return this.streamService.getStreamByStatus("active");
    }
}
