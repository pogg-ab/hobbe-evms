import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketGifts } from 'src/domain/entities/ticket-gifts.entity';
import { ITicketGiftsRepository } from 'src/domain/repositories/tickets/ticket-gifts.repository';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class TicketGiftsRepositoryImpl implements ITicketGiftsRepository {
  constructor(
    @InjectRepository(TicketGifts)
    private ticketGiftsRepository: Repository<TicketGifts>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    manager: EntityManager,
    user: any,
    bookingId: any,
    recipientId: any,
    gifterId: any,
    ticketCount: number,
  ): Promise<void> {
    try {
      const newTicketGift = this.ticketGiftsRepository.create({
        booking_id: bookingId,
        recipient_id: recipientId,
        gifter_id: gifterId,
        ticket_count: ticketCount,
        created_by: user,
        updated_by: user,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await manager.save(newTicketGift);
    } catch (error) {
      throw new HttpException(
        `Error creating Ticket Gift: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByBookingId(
    manager: EntityManager,
    bookingId: string,
  ): Promise<TicketGifts | null> {
    try {
      const ticketGift = await manager.findOne(TicketGifts, {
        where: { booking_id: bookingId },
      });
      return ticketGift || null;
    } catch (error) {
      throw new HttpException(
        `Error fetching Ticket Gift with Booking ID ${bookingId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByBookingIdAndRecipient(
    manager: EntityManager,
    bookingId: string,
    recipientId: string,
  ): Promise<TicketGifts | null> {
    try {
      return await manager.findOne(TicketGifts, {
        where: {
          booking_id: bookingId,
          recipient_id: recipientId,
        },
      });
    } catch (error) {
      throw new HttpException(
        `Error finding Ticket Gift for Booking ${bookingId} and Recipient ${recipientId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(giftId: string): Promise<void> {
    try {
      const gift = await this.ticketGiftsRepository.findOne({
        where: { gift_id: giftId },
      });
      if (!gift) {
        throw new HttpException(
          `Ticket Gift with ID ${giftId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      await this.ticketGiftsRepository.remove(gift);
    } catch (error) {
      throw new HttpException(
        `Error deleting Ticket Gift with ID ${giftId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
