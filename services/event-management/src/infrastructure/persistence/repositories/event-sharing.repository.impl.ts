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
    
    async getShareEvents(user_id: string): Promise<EventShare[] | null> {
        return await this.repository.find({ where: { user_id } });
    }

    async findOne(user_id: string, event_id: string): Promise<EventShare> {
        return await this.repository.findOne({ where: { user_id, event_id } });
    }

    async allShareCounter(): Promise<{ totalFavorites: number }> {
        const totalFavorites = await this.repository.count();
        return { totalFavorites };
    }

    // async eventShareCounter(event_id: string): Promise<{ totalEventFavorites: number }> {
    //     const totalEventFavorites = await this.repository.count({ where: { event_id } });
    //     return { totalEventFavorites };
    // }


      async eventShareCounter(eventId: string): Promise<{ totalEventShare: number }> {
    if (!eventId) throw new Error('event_id is required for event tracking');
    const shareCounter = await this.repository
      .createQueryBuilder('shares')
      .where('shares.event_id = :eventId', { eventId })
      .getCount();

    return { totalEventShare: shareCounter };
  }




}
