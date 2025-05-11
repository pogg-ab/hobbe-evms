import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllStreamsQuery } from 'src/application/queries/live-stream/get-all-streams.query';
import { GetInActiveStreamsQuery } from 'src/application/queries/live-stream/get-inactive-streams.query';
import { StreamService } from 'src/application/services/live-stream/stream.service';

@QueryHandler(GetInActiveStreamsQuery)
export class GetInActiveStreamsHandler implements IQueryHandler<GetInActiveStreamsQuery> {
    constructor(private readonly streamService: StreamService) { }

    async execute(query: GetInActiveStreamsQuery): Promise<any> {
        return this.streamService.getStreamByStatus("inactive");
    }
}
