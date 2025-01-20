import { SpecialGuest } from 'src/domain/entities/special-guest.entity';
import { CreateSpecialGuestDto } from 'src/presentation/dtos/special-guest/create-special-guest.dto';

export interface ISpecialGuestRepository {
  create(createSpecialGuestDto: CreateSpecialGuestDto, user: any): Promise<SpecialGuest>;
  findAll(): Promise<SpecialGuest[]>;
  findOne(id: string): Promise<SpecialGuest | null>;
  findByEventId(eventId: string): Promise<SpecialGuest[]>;
  update(id: string, specialGuest: SpecialGuest): Promise<SpecialGuest>;
  delete(id: string): Promise<void>;
}
