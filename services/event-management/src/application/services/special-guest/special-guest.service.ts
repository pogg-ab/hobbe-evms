import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { SpecialGuest } from 'src/domain/entities/special-guest.entity';
import { ISpecialGuestRepository } from 'src/domain/repositories/special-guest/special-guest.repository';
import { SPECIAL_GUEST_REPOSITORY_TOKEN } from 'src/domain/repositories/special-guest/special-guest.repository.token';
import { CreateSpecialGuestDto } from 'src/presentation/dtos/special-guest/create-special-guest.dto';

@Injectable()
export class SpecialGuestService {
  constructor(
    @Inject(SPECIAL_GUEST_REPOSITORY_TOKEN)
    private readonly specialGuestRepository: ISpecialGuestRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async create(
    createSpecialGuestDto: CreateSpecialGuestDto,
  ): Promise<SpecialGuest> {
    const specialGuest = this.mapper.map(
      createSpecialGuestDto,
      CreateSpecialGuestDto,
      SpecialGuest,
    );
    return this.specialGuestRepository.create(specialGuest);
  }

  async findAll(): Promise<SpecialGuest[]> {
    return this.specialGuestRepository.findAll();
  }

  async findOne(id: string): Promise<SpecialGuest | null> {
    return this.specialGuestRepository.findOne(id);
  }

  async findByEventId(eventId: string): Promise<SpecialGuest[]> {
    return this.specialGuestRepository.findByEventId(eventId);
  }

  async update(
    id: string,
    createSpecialGuestDto: CreateSpecialGuestDto,
  ): Promise<SpecialGuest> {
    const updatedSpecialGuest = this.mapper.map(
      createSpecialGuestDto,
      CreateSpecialGuestDto,
      SpecialGuest,
    );
    return this.specialGuestRepository.update(id, updatedSpecialGuest);
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.specialGuestRepository.delete(id);
    return { message: 'Special Guest Deleted!' };
  }
}
