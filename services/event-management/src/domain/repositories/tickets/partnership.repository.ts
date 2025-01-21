import { Partnership } from 'src/domain/entities/partnership.entity';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { EntityManager } from 'typeorm';

export interface IPartnershipRepository {
  create(
    manager: EntityManager,
    user: any,
    eventOrganizer: string,
    ticketBuyer: string,
    ticketBooking: TicketBooking,
  ): Promise<Partnership>;
  findById(partnershipId: string): Promise<Partnership | null>;
  findAll(): Promise<Partnership[]>;
  update(
    partnershipId: string,
    updateData: Partial<Partnership>,
    user: any,
  ): Promise<Partnership>;
  delete(partnershipId: string): Promise<void>;
}
