import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { IGuestRepository } from 'src/domain/repositories/guests/guest.repository';
import { GUEST_REPOSITORY_TOKEN } from 'src/domain/repositories/guests/guest.repository.token';
import { FilterGuestListDto } from 'src/presentation/dtos/guest/filter-guest-list.dto';
import { UserInfoService } from '../user-info/user-info.service';

@Injectable()
export class GuestsService {
  constructor(
    @Inject(GUEST_REPOSITORY_TOKEN)
    private readonly guestRepository: IGuestRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly userInfoService: UserInfoService,
  ) {}

  async filterGuestList(
    status: 'purchased' | 'arrived' | 'canceled' | 'gifted' | 'pending',
    filters: FilterGuestListDto,
    organizerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    guests: ParticipantHasTicket[] | null;
    total: number;
  }> {
    const offset = (page - 1) * limit;

    const { guests, total } = await this.guestRepository.filterGuestList(
      status,
      filters,
      organizerId,
      offset,
      limit,
    );

    if (!guests) {
      return { guests: null, total };
    }

    const userIds = guests.map((guest) => guest.participant_id);

    let userInfoMap = new Map<string, any>();
    try {
      const userInfoResponse = await this.userInfoService.getUserInfo(userIds);
      if (Array.isArray(userInfoResponse)) {
        userInfoResponse.forEach((info) => {
          userInfoMap.set(info.userId, info);
        });
      } else if (userInfoResponse && typeof userInfoResponse === 'object') {
        Object.entries(userInfoResponse).forEach(([userId, info]) => {
          userInfoMap.set(userId, info);
        });
      }
    } catch (userInfoError) {
      console.error('Failed to fetch participant info:', userInfoError);
    }

    const guestsWithUserInfo = guests.map((guest) => ({
      ...guest,
      userInfo: userInfoMap.get(guest.participant_id) || null,
    }));

    if (filters.gender && filters.gender !== 'all') {
      const filteredGuests = guestsWithUserInfo.filter(
        (guest) =>
          guest.userInfo.account_info.gender?.toLowerCase() ===
          filters.gender.toLowerCase(),
      );
      return {
        guests: filteredGuests.length > 0 ? filteredGuests : null,
        total: filteredGuests.length,
      };
    }

    const sortedGuests = this.sortGuests(guestsWithUserInfo, filters.sort);

    return {
      guests: sortedGuests.length > 0 ? sortedGuests : null,
      total,
    };
  }

  private sortGuests(
    guests: (ParticipantHasTicket & { userInfo?: any })[],
    sortOrder: 'asc' | 'desc' = 'asc',
  ): (ParticipantHasTicket & { userInfo?: any })[] {
    return [...guests].sort((a, b) => {
      // Default sorting by participant name
      const nameA = a.userInfo?.name || '';
      const nameB = b.userInfo?.name || '';

      const comparison = nameA.localeCompare(nameB);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }
}
