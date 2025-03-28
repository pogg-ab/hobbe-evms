import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ConflictException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { SpecialGuest } from 'src/domain/entities/special-guest.entity';
import { IEventRepository } from 'src/domain/repositories/events/event-repository';
import { CREATE_EVENT_REPOSITORY_TOKEN } from 'src/domain/repositories/events/event.repository.token';
import { ISpecialGuestRepository } from 'src/domain/repositories/special-guest/special-guest.repository';
import { SPECIAL_GUEST_REPOSITORY_TOKEN } from 'src/domain/repositories/special-guest/special-guest.repository.token';
import { CreateSpecialGuestDto } from 'src/presentation/dtos/special-guest/create-special-guest.dto';
import { UserInfoService } from '../user-info/user-info.service';

@Injectable()
export class SpecialGuestService {
  constructor(
    @Inject(SPECIAL_GUEST_REPOSITORY_TOKEN)
    private readonly specialGuestRepository: ISpecialGuestRepository,
    @Inject(CREATE_EVENT_REPOSITORY_TOKEN)
    private readonly eventRepository: IEventRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly userInfoService: UserInfoService,
  ) { }

  async create(
    createSpecialGuestDto: CreateSpecialGuestDto, user: any
  ): Promise<any> {
    const { event_id, guest_user_id } = createSpecialGuestDto;

    const event = await this.eventRepository.findOne(event_id.toString());
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    let specialGuests: SpecialGuest[] = [];
    try {
      specialGuests = await this.specialGuestRepository.findByEventId(event_id.toString());
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === HttpStatus.NOT_FOUND) {
        specialGuests = [];
      } else {
        throw error;
      }
    }
    const isAlreadyConnected = guest_user_id.some(id =>
      (specialGuests).some(guest => guest.guest_user_id === id)
    );
    if (isAlreadyConnected) {
      throw new ConflictException('One or more guests are already connected to the event.');
    }

    const specialGuestsToCreate = guest_user_id.map(id => {
      return this.mapper.map(
        { ...createSpecialGuestDto, guest_user_id: [id] }
        ,
        CreateSpecialGuestDto,
        SpecialGuest
      );
    });

    const createdGuests = await Promise.all(
      specialGuestsToCreate.map(specialGuest =>
        this.specialGuestRepository.create(specialGuest, user)
      )
    ).then(results => results);

    return {
      success: true,
      message: `Successfully added ${guest_user_id.length} guest(s) to the event`,
      data: createdGuests
    };

  }

  async findAll(): Promise<SpecialGuest[]> {
    const specialGuests = await this.specialGuestRepository.findAll();

    if (specialGuests.length === 0) {
      return specialGuests;
    }

    const userIds = [...new Set(specialGuests.map(guest => guest.guest_user_id))];

    try {
      const userInfoResponse = await this.userInfoService.getUserInfo(userIds);

      return specialGuests.map(guest => ({
        ...guest,
        userInfo: userInfoResponse[guest.guest_user_id] || null,
      }));
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return specialGuests.map(guest => ({
        ...guest,
        userInfo: null,
      }));
    }
  }

  async findOne(id: string): Promise<any | null> {
    const specialGuest = await this.specialGuestRepository.findOne(id);

    if (!specialGuest) {
      return null;
    }

    try {
      const userInfoResponse = await this.userInfoService.getUserInfo([specialGuest.guest_user_id]);

      return {
        ...specialGuest,
        userInfo: userInfoResponse[specialGuest.guest_user_id] || null,
      };
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return {
        ...specialGuest,
        userInfo: null,
      };
    }
  }

  async findByEventId(eventId: string): Promise<SpecialGuest[]> {
    const specialGuests = await this.specialGuestRepository.findByEventId(eventId);

    if (specialGuests.length === 0) {
      return specialGuests;
    }

    const userIds = [...new Set(specialGuests.map(guest => guest.guest_user_id))];

    try {
      const userInfoResponse = await this.userInfoService.getUserInfo(userIds);

      return specialGuests.map(guest => ({
        ...guest,
        userInfo: userInfoResponse[guest.guest_user_id] || null,
      }));
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return specialGuests.map(guest => ({
        ...guest,
        userInfo: null,
      }));
    }
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
