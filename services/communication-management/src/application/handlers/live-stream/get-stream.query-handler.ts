import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetStreamQuery } from 'src/application/queries/live-stream/get-stream.query';
import { StreamService } from 'src/application/services/live-stream/stream.service';
@QueryHandler(GetStreamQuery)
export class GetStreamHandler implements IQueryHandler<GetStreamQuery> {
  constructor(private readonly streamService: StreamService) {}

  async execute(query: GetStreamQuery): Promise<any> {
    return this.streamService.getStreamById(query.streamId);
  }
}
