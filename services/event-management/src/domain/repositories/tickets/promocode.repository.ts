import { Promocodes } from 'src/domain/entities/promocodes.entity';
import { CreatePromocodeDto } from 'src/presentation/dtos/tickets/create-promocode.dto';

export interface IPromocode {
  create(createPromocodeDto: CreatePromocodeDto): Promise<Promocodes>;
  findAll(): Promise<Promocodes[]>;
  findOne(id: string): Promise<Promocodes | null>;
  findByCode(code: string, eventId: any): Promise<Promocodes | null>;
  update(id: string, promocode: Promocodes): Promise<Promocodes>;
  findByEventId(eventId: string): Promise<Promocodes | null>;
}
