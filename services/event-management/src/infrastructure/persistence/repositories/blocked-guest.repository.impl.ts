import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockedGuest } from 'src/domain/entities/blocked-guest.entity';
import { IBlockedGuestRepository } from 'src/domain/repositories/guests/blocked-guest.repository';

@Injectable()
export class BlockedGuestRepositoryImpl implements IBlockedGuestRepository {
  constructor(
    @InjectRepository(BlockedGuest)
    private readonly repository: Repository<BlockedGuest>,
  ) {}

  create(data: Partial<BlockedGuest>): BlockedGuest {
    return this.repository.create(data);
  }

  save(blockedGuest: BlockedGuest): Promise<BlockedGuest> {
    return this.repository.save(blockedGuest);
  }

  findById(blockId: string): Promise<BlockedGuest | null> {
    return this.repository.findOne({
      where: { block_id: blockId },
      relations: ['participant', 'event'],
    });
  }

  findBlockedGuestsByOrganizer(organizerId: string): Promise<BlockedGuest[]> {
    return this.repository
      .createQueryBuilder('blocked')
      .leftJoinAndSelect('blocked.participant', 'participant')
      .leftJoinAndSelect('participant.ticket_id', 'ticket')
      .leftJoinAndSelect('ticket.event_id', 'event')
      .where('blocked.blocked_by = :organizerId', { organizerId })
      .orderBy('blocked.created_at', 'DESC')
      .getMany();
  }

  findByTicketId(ticketId: string): Promise<BlockedGuest | null> {
    return this.repository
      .createQueryBuilder('blocked')
      .leftJoinAndSelect('blocked.participant', 'participant')
      .where('participant.ticket_id = :ticketId', { ticketId })
      .getOne();
  }
}
