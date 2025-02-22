import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetStreamsByUserIdQuery } from 'src/application/queries/live-stream/get-streams-by-user-id.query';
import { StreamService } from 'src/application/services/live-stream/stream.service';

@QueryHandler(GetStreamsByUserIdQuery)
export class GetStreamsByUserIdQueryHandler
    implements IQueryHandler<GetStreamsByUserIdQuery> {
    constructor(private readonly streamService: StreamService) { }

    async execute(query: GetStreamsByUserIdQuery): Promise<any> {
        const { userId } = query;
        return this.streamService.findByUserId(userId);
    }
}