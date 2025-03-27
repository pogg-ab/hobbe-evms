import { EventSponsor } from 'src/domain/entities/event-sponsor.entity';
import { CreateEventSponsorDto } from 'src/presentation/dtos/event-sponsor/create-event-sponsor.dto';

export interface IEventSponsorRepository {
  create(createEventSponsor: EventSponsor, user: any): Promise<EventSponsor>;
  findAll(): Promise<EventSponsor[]>;
  findOne(id: string): Promise<EventSponsor | null>;
  findByEventId(eventId: string): Promise<EventSponsor[]>;
  update(id: string, eventSponsor: EventSponsor): Promise<EventSponsor>;
  delete(id: string): Promise<void>;
}
