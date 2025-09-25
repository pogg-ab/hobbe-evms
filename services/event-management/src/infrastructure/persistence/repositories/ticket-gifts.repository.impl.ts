import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketsService } from 'src/application/services/tickets/tickets.service';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { TicketGifts } from 'src/domain/entities/ticket-gifts.entity';
import { ITicketGiftsRepository } from 'src/domain/repositories/tickets/ticket-gifts.repository';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class TicketGiftsRepositoryImpl
  implements ITicketGiftsRepository, ITicketsGiftRepository
{
  constructor(
    @InjectRepository(TicketGifts)
    private ticketGiftsRepository: Repository<TicketGifts>,
    private readonly dataSource: DataSource,
    private readonly ticketService: TicketsService,
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

  async findAllSentGifts(userId: string): Promise<any> {
    try {
      const gifts = await this.ticketGiftsRepository.find({
        where: { gifter_id: userId },
        order: { created_at: 'DESC' },
        relations: ['booking_id', 'booking_id.participants.ticket_id'],
      });

      return gifts;
    } catch (error) {
      throw new HttpException(
        `Error fetching sent Ticket Gifts for user ${userId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllReceivedGifts(userId: string): Promise<any> {
    try {
      const gifts = await this.ticketGiftsRepository.find({
        where: { recipient_id: userId },
        order: { created_at: 'DESC' },
        relations: ['booking_id', 'booking_id.participants.ticket_id'],
      });
      return gifts;
    } catch (error) {
      throw new HttpException(
        `Error fetching received Ticket Gifts for user ${userId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async cancelTicketGift(
    giftId: string,
    userId: string,
    newReceipantId?: string,
  ): Promise<any> {
    try {
      // 1. Validate gift ownership
      const gift = await this.ticketGiftsRepository.findOne({
        where: { gift_id: giftId, gifter_id: userId },
        relations: ['booking_id'], // fetch related booking
      });

      if (!gift) {
        throw new HttpException(
          `Ticket Gift with ID ${giftId} not found or not authorized`,
          HttpStatus.NOT_FOUND,
        );
      }

      // 2. Find all gifted participants for this booking
      const participants = await this.dataSource
        .getRepository(ParticipantHasTicket)
        .createQueryBuilder('participant')
        .leftJoinAndSelect('participant.ticket_id', 'ticket')
        .where('participant.booking_id = :bookingId', {
          bookingId: gift.booking_id['booking_id'], // booking_id is an object relation
        })
        .getMany();

      // 3. Reset participants back to gifter
      if (participants.length > 0) {
        if (newReceipantId) {
          // change recipient of the gift
          await this.dataSource
            .createQueryBuilder()
            .update(ParticipantHasTicket)
            .set({ participant_id: newReceipantId })
            .whereInIds(participants.map((p) => p.participant_has_ticket_id))
            .execute();
        } else {
          await this.dataSource
            .createQueryBuilder()
            .update(ParticipantHasTicket)
            .set({ participant_id: gift.gifter_id })
            .whereInIds(participants.map((p) => p.participant_has_ticket_id))
            .execute();
        }
      }

      // 4, generate new tickets qr code with new ticket number for the gifter
      for (const participant of participants) {
        const ticketId =
          typeof participant.ticket_id === 'object'
            ? participant.ticket_id.id
            : participant.ticket_id;
        console.log('Regenerating QR code for ticket ID:', ticketId.toString());
      
        await this.ticketService.regenerateTicketQrCode(ticketId.toString(),userId);
      }

      // 5. Delete gift record
      if(newReceipantId){
        gift.recipient_id = newReceipantId;
        await this.ticketGiftsRepository.save(gift);
        return { message: 'Gift ticket recipient changed successfully.' };
      }else{
      await this.ticketGiftsRepository.remove(gift);
      }

      return { message: 'Gift ticket cancelled successfully.' };
    } catch (error) {
      throw new HttpException(
        `Error cancelling Ticket Gift with ID ${giftId}: ${error.message}`,
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
