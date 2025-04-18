import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllStreamsQuery } from 'src/application/queries/live-stream/get-all-streams.query';
import { StreamService } from 'src/application/services/live-stream/stream.service';

@QueryHandler(GetAllStreamsQuery)
export class GetAllStreamsHandler implements IQueryHandler<GetAllStreamsQuery> {
  constructor(private readonly streamService: StreamService) { }

  async execute(query: GetAllStreamsQuery): Promise<any> {
    return this.streamService.getStreamByStatus();
  }
}
