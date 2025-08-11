// src/application/services/guests.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { IGuestRepository } from 'src/domain/repositories/guests/guest.repository';
import { GUEST_REPOSITORY_TOKEN } from 'src/domain/repositories/guests/guest.repository.token';
import { FilterGuestListDto } from 'src/presentation/dtos/guest/filter-guest-list.dto';

@Injectable()
export class GuestsService {
  constructor(
    @Inject(GUEST_REPOSITORY_TOKEN)
    private readonly guestRepository: IGuestRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async filterGuestList(
    status: 'purchased' | 'arrived' | 'canceled' | 'gifted',
    filters: FilterGuestListDto,
  ): Promise<{ guests: ParticipantHasTicket[] | null }> {
    const guests = await this.guestRepository.filterGuestList(status, filters);
    return { guests: guests || null };
  }
}
