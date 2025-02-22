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
  ) { }

  async create(stream: Stream): Promise<Stream> {
    await this.streamRepository.save(stream);
    return stream;
  }

  async findById(id: string): Promise<Stream | null> {
    return await this.streamRepository.findOne({
      where: { id: id },
    });
  }

  async findByUserId(userId: string): Promise<Stream[]> {
    return this.streamRepository.find({ where: { userId }, order: { createdAt: 'DESC' }, });
  }

  async findAll(): Promise<Stream[]> {
    return await this.streamRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async update(stream: Stream): Promise<Stream> {

    return await this.streamRepository.save(stream);
  }

  async delete(id: StreamID): Promise<void> {
    await this.streamRepository.delete(id.getValue());
  }
}
