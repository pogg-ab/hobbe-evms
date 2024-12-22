import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Partnership } from 'src/domain/entities/partnership.entity';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { IPartnershipRepository } from 'src/domain/repositories/tickets/partnership.repository';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class PartnershipRepositoryImpl implements IPartnershipRepository {
  constructor(
    @InjectRepository(Partnership)
    private partnershipRepository: Repository<Partnership>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    manager: EntityManager,
    user: any,
    eventOrganizer: string,
    ticketBuyer: string,
    ticketBooking: TicketBooking,
  ): Promise<Partnership> {
    try {
      if (!ticketBooking) {
        throw new HttpException(
          `TicketBooking not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      const newPartnership = this.partnershipRepository.create({
        event_organizer: eventOrganizer,
        ticket_buyer: ticketBuyer,
        booking_id: ticketBooking,
        created_by: user,
        updated_by: user,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const savedPartnership = await manager.save(newPartnership);

      return savedPartnership;
    } catch (error) {
      throw new HttpException(
        `Error creating Partnership: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(partnershipId: string): Promise<Partnership | null> {
    try {
      const partnership = await this.partnershipRepository.findOne({
        where: { partnership_id: partnershipId },
      });
      return partnership || null;
    } catch (error) {
      throw new HttpException(
        `Error fetching Partnership with ID ${partnershipId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<Partnership[]> {
    try {
      return await this.partnershipRepository.find();
    } catch (error) {
      throw new HttpException(
        `Error fetching Partnerships: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    partnershipId: string,
    updateData: Partial<Partnership>,
    user: any,
  ): Promise<Partnership> {
    try {
      const partnership = await this.findById(partnershipId);
      if (!partnership) {
        throw new HttpException(
          `Partnership with ID ${partnershipId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      Object.assign(partnership, updateData);
      partnership.updated_by = user;
      partnership.updated_at = new Date();

      return await this.partnershipRepository.save(partnership);
    } catch (error) {
      throw new HttpException(
        `Error updating Partnership with ID ${partnershipId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(partnershipId: string): Promise<void> {
    try {
      const partnership = await this.findById(partnershipId);
      if (!partnership) {
        throw new HttpException(
          `Partnership with ID ${partnershipId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      await this.partnershipRepository.remove(partnership);
    } catch (error) {
      throw new HttpException(
        `Error deleting Partnership with ID ${partnershipId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
