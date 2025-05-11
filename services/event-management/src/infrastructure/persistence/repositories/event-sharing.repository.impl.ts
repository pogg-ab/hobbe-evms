import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EventShare } from 'src/domain/entities/event-share.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IEventShareRepository } from 'src/domain/repositories/event-sharing/event-sharing.repository';

@Injectable()
export class EventShareRepository implements IEventShareRepository{
    constructor(
        @InjectRepository(EventShare)
        private readonly repository: Repository<EventShare>,
    ) {}

    async create(eventShare: EventShare): Promise<EventShare> {
        return await this.repository.save(eventShare);
    }
}
