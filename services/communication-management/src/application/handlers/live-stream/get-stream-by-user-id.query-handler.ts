import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetStreamByEventIdQuery } from 'src/application/queries/live-stream/get-stream-by-event-id.query';
import { StreamService } from 'src/application/services/live-stream/stream.service';
@QueryHandler(GetStreamByEventIdQuery)
export class GetStreamByEventIdHandler implements IQueryHandler<GetStreamByEventIdQuery> {
    constructor(private readonly streamService: StreamService) { }

    async execute(query: GetStreamByEventIdQuery): Promise<any> {
        return this.streamService.getStreamByEventId(query.eventId);
    }
}
