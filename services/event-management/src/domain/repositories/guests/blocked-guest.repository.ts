import { BlockedGuest } from 'src/domain/entities/blocked-guest.entity';

export interface IBlockedGuestRepository {
  create(data: Partial<BlockedGuest>): BlockedGuest;
  save(blockedGuest: BlockedGuest): Promise<BlockedGuest>;
  findById(blockId: string): Promise<BlockedGuest | null>;
  findBlockedGuestsByOrganizer(organizerId: string): Promise<BlockedGuest[]>;
  findByTicketId(ticketId: string): Promise<BlockedGuest | null>;
}
