import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { EVENT_SHARING_REPOSITORY_TOKEN } from 'src/domain/repositories/event-sharing/event-sharing.repository.token';
import { EventShare } from 'src/domain/entities/event-share.entity';
import { IEventShareRepository } from 'src/domain/repositories/event-sharing/event-sharing.repository';
import { ShareEventDto } from 'src/presentation/dtos/share-event/share-event.dto';
import { SocketIo } from 'src/infrastructure/socket-io/socket.gateway';

@Injectable()
export class EventSharingService {
  constructor(
    @Inject(EVENT_SHARING_REPOSITORY_TOKEN)
    private readonly eventSharingRepository: IEventShareRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly socket:SocketIo
    
  ) {}

  async shareEvent(user: string, shareEventDto: ShareEventDto): Promise<EventShare> {
    
    const eventShare = this.mapper.map(shareEventDto, ShareEventDto, EventShare);

 
    eventShare.user_id = user;

    eventShare.shared_at = new Date();
    const share =  await this.eventSharingRepository.create(eventShare);
    const allShareCounter = this.eventSharingRepository.allShareCounter();
    const eventShareCounter = this.eventSharingRepository.eventShareCounter(eventShare.event_id.toString());
   
    this.socket.handleAllEventShareCounter("All-Time-Share-Counters : "+(await allShareCounter).totalFavorites);
    this.socket.handleSigleEventShareCounter({'event_id':eventShare.event_id, counter:(await eventShareCounter).totalEventShare});
    return share
  }
}
