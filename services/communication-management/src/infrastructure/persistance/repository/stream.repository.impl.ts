// src/infrastructure/repositories/stream.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stream } from 'src/domain/entities/stream.entity';
import { IStreamRepository } from 'src/domain/repositories/live-stream/stream.repository';
import { StreamID } from 'src/domain/value-objects/stream-id.value-object';
import { Repository } from 'typeorm';

@Injectable()
export class StreamRepositoryImpl implements IStreamRepository {
  constructor(
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,
  ) {}

  async create(stream: Stream): Promise<Stream> {
    await this.streamRepository.save(stream);
    return stream;
  }

  async findById(id: StreamID): Promise<Stream | null> {
    return await this.streamRepository.findOne({
      where: { id: id.getValue() },
    });
  }

  async findAll(): Promise<Stream[]> {
    return await this.streamRepository.find();
  }

  async update(stream: Stream): Promise<Stream> {
    const result = await this.streamRepository.findOne({
      where: { id: stream.id.toString() },
    });
    if (!stream) throw new Error('Stream not found');

    stream.url = result.url;
    stream.status = result.status;
    stream.updatedAt = new Date();
    stream.updatedBy = result.updatedBy;

    return await this.streamRepository.save(stream);
  }

  async delete(id: StreamID): Promise<void> {
    await this.streamRepository.delete(id.getValue());
  }
}
