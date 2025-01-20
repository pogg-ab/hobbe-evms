import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SpecialGuest } from 'src/domain/entities/special-guest.entity';
import { ISpecialGuestRepository } from 'src/domain/repositories/special-guest/special-guest.repository';
import { CreateSpecialGuestDto } from 'src/presentation/dtos/special-guest/create-special-guest.dto';
import { Repository } from 'typeorm';

@Injectable()
export class SpecialGuestRepositoryImpl implements ISpecialGuestRepository {
  constructor(
    @InjectRepository(SpecialGuest)
    private readonly specialGuestRepository: Repository<SpecialGuest>,
  ) { }

  async create(
    createSpecialGuestDto: CreateSpecialGuestDto,
  ): Promise<SpecialGuest> {
    return this.specialGuestRepository.save(createSpecialGuestDto);
  }

  async findAll(): Promise<SpecialGuest[]> {
    return this.specialGuestRepository.find();
  }

  async findOne(id: string): Promise<SpecialGuest | null> {
    try {
      const specialGuest = await this.specialGuestRepository.findOne({
        where: { special_guest_id: id },
      });

      if (!specialGuest) {
        throw new HttpException(
          `Special Guest with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return specialGuest;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          `Error fetching Special Guest with ID ${id}: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async findByEventId(eventId: string): Promise<SpecialGuest[]> {
    try {
      const specialGuests = await this.specialGuestRepository
        .createQueryBuilder('specialGuest')
        .where('specialGuest.event_id = :eventId', { eventId: eventId.toString() })
        .getMany();

      if (specialGuests.length === 0) {
        throw new HttpException(
          `No Special Guests found for this Event`,
          HttpStatus.NOT_FOUND,
        );
      }
      return specialGuests;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          `Error fetching Special Guests for Event ID ${eventId}: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async update(id: string, specialGuest: SpecialGuest): Promise<SpecialGuest> {
    try {
      const specialGuestToUpdate = await this.findOne(id);
      const updatedSpecialGuest = Object.assign(
        specialGuestToUpdate,
        specialGuest,
      );
      return await this.specialGuestRepository.save(updatedSpecialGuest);
    } catch (error) {
      throw new HttpException(
        `Error updating Special Guest: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const specialGuest = await this.findOne(id);
      await this.specialGuestRepository.delete(id);
    } catch (error) {
      throw new HttpException(
        `Error deleting Special Guest: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
