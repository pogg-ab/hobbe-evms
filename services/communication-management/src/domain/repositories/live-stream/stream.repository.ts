import { Stream } from 'src/domain/entities/stream.entity';
import { StreamID } from 'src/domain/value-objects/stream-id.value-object';

export interface IStreamRepository {
  create(stream: Stream): Promise<Stream>;
  findById(id: string): Promise<Stream | null>;
  findByUserId(userId: string): Promise<Stream[]>;
  findAll(): Promise<Stream[]>;
  findByStatus(status: string): Promise<Stream[]>;
  update(stream: Stream): Promise<Stream>;
  delete(id: StreamID): Promise<void>;
}
