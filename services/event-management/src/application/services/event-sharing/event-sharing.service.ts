import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { EVENT_SHARING_REPOSITORY_TOKEN } from 'src/domain/repositories/event-sharing/event-sharing.repository.token';
import { EventShare } from 'src/domain/entities/event-share.entity';
import { IEventShareRepository } from 'src/domain/repositories/event-sharing/event-sharing.repository';
import { ShareEventDto } from 'src/presentation/dtos/share-event/share-event.dto';

@Injectable()
export class EventSharingService {
  constructor(
    @Inject(EVENT_SHARING_REPOSITORY_TOKEN)
    private readonly eventSharingRepository: IEventShareRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async shareEvent(user: string, shareEventDto: ShareEventDto): Promise<EventShare> {
    
    const eventShare = this.mapper.map(shareEventDto, ShareEventDto, EventShare);

 
    eventShare.user_id = user;

    eventShare.shared_at = new Date();


    return await this.eventSharingRepository.create(eventShare);
  }
}
