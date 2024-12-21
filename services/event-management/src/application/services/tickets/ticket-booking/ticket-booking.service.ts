import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { IEventRepository } from 'src/domain/repositories/events/event-repository';
import { CREATE_EVENT_REPOSITORY_TOKEN } from 'src/domain/repositories/events/event.repository.token';
import {
  CREATE_PARTICIPANT_HAS_TICKET_REPOSITORY_TOKEN,
  IParticipantHasTicketRepository,
} from 'src/domain/repositories/tickets/participant-has-ticket.repository';
import { ITicketBookingRepository } from 'src/domain/repositories/tickets/ticket-booking.repository';
import { CREATE_TICKET_BOOKING_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/ticket-booking.repository.token';
import { ITicketGiftsRepository } from 'src/domain/repositories/tickets/ticket-gifts.repository';
import { CREATE_TICKET_GIFTS_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/ticket-gifts.repository.token';
import { ITicketsHeadingRepository } from 'src/domain/repositories/tickets/tickets-heading.repository';
import { CREATE_TICKET_HEADING_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/tickets-heading.repository.token';
import { ITicketsRepository } from 'src/domain/repositories/tickets/tickets.repository';
import { CREATE_TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/tickets.repository.token';
import { CreateTicketBookingDto } from 'src/presentation/dtos/tickets/create-ticket-booking.dto';
import { UpdateTicketBookingDto } from 'src/presentation/dtos/tickets/update-ticket-booking.dto';

@Injectable()
export class TicketBookingService {
  constructor(
    @Inject(CREATE_TICKET_BOOKING_REPOSITORY_TOKEN)
    private readonly ticketBookingRepository: ITicketBookingRepository,
    @Inject(CREATE_TICKET_REPOSITORY_TOKEN)
    private readonly ticketRepository: ITicketsRepository,
    @Inject(CREATE_EVENT_REPOSITORY_TOKEN)
    private readonly eventRepository: IEventRepository,
    @Inject(CREATE_TICKET_HEADING_REPOSITORY_TOKEN)
    private readonly ticketHeadingRepository: ITicketsHeadingRepository,
    @Inject(CREATE_PARTICIPANT_HAS_TICKET_REPOSITORY_TOKEN)
    private readonly participantHasTicketRepository: IParticipantHasTicketRepository,

    @Inject(CREATE_TICKET_GIFTS_REPOSITORY_TOKEN)
    private readonly giftRepository: ITicketGiftsRepository,

    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async create(
    createTicketBookingDto: CreateTicketBookingDto,
    user: any,
  ): Promise<void> {
    const eventId = createTicketBookingDto.event_id.toString();
    const ticketCount = createTicketBookingDto.total_amount;
    const event = await this.eventRepository.findOne(eventId);
    if (!event) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Event not found',
        error: 'Not Found',
      });
    }
    const ticketHeadings =
      await this.ticketHeadingRepository.findHeadingsByEventId(eventId);

    if (!ticketHeadings || ticketHeadings.length === 0) {
      throw new NotFoundException(
        'No ticket headings found for the specified event',
      );
    }

    const ticketHeading = ticketHeadings[0];

    // Check the valid ticket count for the type
    if (createTicketBookingDto.booking_type === 'VIP') {
      if (
        ticketCount < ticketHeading.vip_min_order ||
        ticketCount > ticketHeading.vip_max_order
      ) {
        throw new BadRequestException(
          `Requested ticket count (${ticketCount}) is out of the valid range for VIP tickets (${ticketHeading.vip_min_order} - ${ticketHeading.vip_max_order}).`,
        );
      }
      // Validate the price for VIP tickets
      const calculatedPrice = ticketHeading.vip_price * ticketCount;
      if (calculatedPrice !== createTicketBookingDto.total_price) {
        throw new BadRequestException(
          `Total price for VIP tickets is invalid. Expected price: ${calculatedPrice}, but received: ${createTicketBookingDto.total_price}.`,
        );
      }
    } else if (createTicketBookingDto.booking_type === 'VVIP') {
      if (
        ticketCount < ticketHeading.vvip_min_order ||
        ticketCount > ticketHeading.vvip_max_order
      ) {
        throw new BadRequestException(
          `Requested ticket count (${ticketCount}) is out of the valid range for VVIP tickets (${ticketHeading.vvip_min_order} - ${ticketHeading.vvip_max_order}).`,
        );
      }
      // Validate the price for VVIP tickets
      const calculatedPrice = ticketHeading.vvip_price * ticketCount;
      if (calculatedPrice !== createTicketBookingDto.total_price) {
        throw new BadRequestException(
          `Total price for VVIP tickets is invalid. Expected price: ${calculatedPrice}, but received: ${createTicketBookingDto.total_price}.`,
        );
      }
    } else {
      // For regular tickets, check the general range
      if (
        ticketCount < ticketHeading.min_order ||
        ticketCount > ticketHeading.max_order
      ) {
        throw new BadRequestException(
          `Requested ticket count (${ticketCount}) is out of the valid range for regular tickets (${ticketHeading.min_order} - ${ticketHeading.max_order}).`,
        );
      }
      // Validate the price for general tickets
      const calculatedPrice = ticketHeading.price * ticketCount;
      if (calculatedPrice !== createTicketBookingDto.total_price) {
        throw new BadRequestException(
          `Total price for regular tickets is invalid. Expected price: ${calculatedPrice}, but received: ${createTicketBookingDto.total_price}.`,
        );
      }
    }
    const tickets =
      await this.ticketRepository.findTicketsByStatusTypeAndPromocode(
        event.id,
        createTicketBookingDto.booking_type,
        'New',
        createTicketBookingDto.hasPromocode,
      );

    if (!tickets || tickets.length === 0) {
      const promocodeMessage = createTicketBookingDto.hasPromocode
        ? ' with the provided promocode'
        : '';
      throw new NotFoundException(
        `No tickets found for the event with the specified booking type${promocodeMessage}.`,
      );
    }

    if (ticketCount > tickets.length) {
      throw new BadRequestException(
        `Requested ticket count (${ticketCount}) exceeds the available tickets (${tickets.length}).`,
      );
    }

    const selectedTickets = this.getRandomTickets(tickets, ticketCount);

    const ticketBooking = this.mapper.map(
      createTicketBookingDto,
      CreateTicketBookingDto,
      TicketBooking,
    );
    const createdBooking = await this.ticketBookingRepository.create(
      ticketBooking,
      user,
    );

    for (let i = 0; i < ticketCount; i++) {
      const status = createTicketBookingDto.hasGift ? 'Gifted' : 'Booked';
      const participantId = createTicketBookingDto.hasGift
        ? createTicketBookingDto.recipient_id
        : user;

      if (createTicketBookingDto.hasGift) {
        await this.giftRepository.create(
          user,
          createdBooking.booking_id,
          createTicketBookingDto.recipient_id,
          user,
        );
      }

      await this.ticketRepository.updateStatus(selectedTickets[i].id, status);

      await this.participantHasTicketRepository.create(
        createdBooking.booking_id,
        selectedTickets[i].id,
        participantId,
        user,
      );
    }
  }

  // Helper function to randomly select tickets
  getRandomTickets(tickets: any[], ticketCount: number): any[] {
    const selectedTickets: any[] = [];
    const availableTickets = [...tickets];

    for (let i = 0; i < ticketCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableTickets.length);
      selectedTickets.push(availableTickets[randomIndex]);
      availableTickets.splice(randomIndex, 1);
    }

    return selectedTickets;
  }

  async getTicketBookingById(id: string): Promise<TicketBooking | null> {
    const ticketBooking = await this.ticketBookingRepository.findOne(id);
    if (!ticketBooking) {
      throw new NotFoundException(`Ticket booking with id ${id} not found.`);
    }
    return ticketBooking;
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{
    ticketBookings: TicketBooking[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    return this.ticketBookingRepository.findAll(page, limit);
  }

  async findAllByEvent(event_id: string): Promise<TicketBooking[] | null> {
    return this.ticketBookingRepository.findAllByEvent(event_id);
  }

  async findAllByTicketBuyer(
    ticket_buyer_id: string,
  ): Promise<TicketBooking[] | null> {
    return this.ticketBookingRepository.findAllByTicketBuyer(ticket_buyer_id);
  }

  async findAllByEventOrganizer(
    event_organizer_id: string,
  ): Promise<TicketBooking[] | null> {
    return this.ticketBookingRepository.findAllByEventOrganizer(
      event_organizer_id,
    );
  }

  async update(
    id: string,
    updateTicketBookingDto: UpdateTicketBookingDto,
    user: any,
  ): Promise<TicketBooking> {
    const ticketBooking = await this.getTicketBookingById(id);
    const updatedTicketBooking = this.mapper.map(
      updateTicketBookingDto,
      CreateTicketBookingDto,
      TicketBooking,
    );
    await this.ticketBookingRepository.update(id, updatedTicketBooking, user);
    return updatedTicketBooking;
  }

  async delete(id: string): Promise<void> {
    const ticketBooking = await this.getTicketBookingById(id);
    if (!ticketBooking) {
      throw new NotFoundException(`Ticket booking with id ${id} not found.`);
    }
    await this.ticketBookingRepository.delete(id);
  }

  async markTicketAsAttended(
    ticketId: string,
    scannedBy: string,
  ): Promise<Tickets> {
    const ticket = await this.ticketRepository.findOne(ticketId);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.status = 'ATTENDED';

    return null;
  }
}
