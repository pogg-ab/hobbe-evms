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
import { IBookingHasPromocodeRepository } from 'src/domain/repositories/tickets/booking-has-promocode.repository';
import { CREATE_BOOKING_HAS_PROMOCODE_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/booking-has-promocode.repository.token';
import {
  CREATE_PARTICIPANT_HAS_TICKET_REPOSITORY_TOKEN,
  IParticipantHasTicketRepository,
} from 'src/domain/repositories/tickets/participant-has-ticket.repository';
import { IPartnershipRepository } from 'src/domain/repositories/tickets/partnership.repository';
import { CREATE_PARTNERSHIP_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/partnership.repository.token';
import { IPromocode } from 'src/domain/repositories/tickets/promocode.repository';
import { CREATE_PROMOCODE_TOKEN } from 'src/domain/repositories/tickets/promocode.repository.token';
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
import { DataSource } from 'typeorm';

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
    @Inject(CREATE_PARTNERSHIP_REPOSITORY_TOKEN)
    private readonly partnershipRepository: IPartnershipRepository,
    @Inject(CREATE_PROMOCODE_TOKEN)
    private readonly promocodeRepository: IPromocode,
    @Inject(CREATE_BOOKING_HAS_PROMOCODE_REPOSITORY_TOKEN)
    private readonly bookingHasPromocodeRepository: IBookingHasPromocodeRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private dataSource: DataSource,
  ) {}

  async create(
    createTicketBookingDto: CreateTicketBookingDto,
    user: any,
  ): Promise<void> {
    const eventId = createTicketBookingDto.event_id.toString();
    const ticketCount = createTicketBookingDto.total_amount;
    const currentDate = new Date();
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      // 1. Validate event existence and status
      const event = await this.eventRepository.findOne(eventId);
      if (!event) {
        throw new NotFoundException({
          statusCode: 404,
          message: 'Event not found',
          error: 'Not Found',
        });
      }

      if (event.event_end_date < currentDate) {
        throw new BadRequestException(
          `Event has already ended. Event end date: ${event.event_end_date}`,
        );
      }

      // 2. Validate ticket heading availability
      const ticketHeadings =
        await this.ticketHeadingRepository.findHeadingsByEventId(eventId);
      if (!ticketHeadings || ticketHeadings.length === 0) {
        throw new NotFoundException(
          'No ticket headings found for the specified event',
        );
      }

      const ticketHeading = ticketHeadings[0];

      // 3. Validate sales start and end dates
      if (ticketHeading.sales_start > currentDate) {
        throw new BadRequestException(
          `Ticket sales have not started yet. Sales start date: ${ticketHeading.sales_start}`,
        );
      }

      if (ticketHeading.sales_end < currentDate) {
        throw new BadRequestException(
          `Ticket sales have ended. Sales end date: ${ticketHeading.sales_end}`,
        );
      }

      // 4. Validate ticket count based on booking type
      const ticketType = createTicketBookingDto.booking_type;
      let pricePerTicket: number;
      let minOrder: number;
      let maxOrder: number;
      let minOrderErrorMessage: string;
      let maxOrderErrorMessage: string;

      switch (ticketType) {
        case 'VIP':
          minOrder = ticketHeading.vip_min_order;
          maxOrder = ticketHeading.vip_max_order;
          pricePerTicket = ticketHeading.vip_price;
          minOrderErrorMessage = `Requested ticket count (${ticketCount}) is out of the valid range for VIP tickets (${minOrder} - ${maxOrder}).`;
          break;

        case 'VVIP':
          minOrder = ticketHeading.vvip_min_order;
          maxOrder = ticketHeading.vvip_max_order;
          pricePerTicket = ticketHeading.vvip_price;
          minOrderErrorMessage = `Requested ticket count (${ticketCount}) is out of the valid range for VVIP tickets (${minOrder} - ${maxOrder}).`;
          break;

        default:
          minOrder = ticketHeading.min_order;
          maxOrder = ticketHeading.max_order;
          pricePerTicket = ticketHeading.price;
          minOrderErrorMessage = `Requested ticket count (${ticketCount}) is out of the valid range for regular tickets (${minOrder} - ${maxOrder}).`;
          break;
      }

      if (ticketCount < minOrder || ticketCount > maxOrder) {
        throw new BadRequestException(minOrderErrorMessage);
      }

      // 5. Calculate initial total price
      let calculatedPrice = pricePerTicket * ticketCount;

      // 6. Check availability of tickets
      const tickets =
        await this.ticketRepository.findTicketsByStatusTypeAndPromocode(
          event.id,
          ticketType,
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

      // 7. Apply promocode discount if applicable
      let promocode = null;
      if (createTicketBookingDto.hasPromocode) {
        promocode = await this.promocodeRepository.findByCode(
          createTicketBookingDto.promocode_value,
          eventId,
        );

        if (!promocode) {
          throw new BadRequestException(
            'Invalid or expired promocode for this event.',
          );
        }
        const bookingIds =
          await this.bookingHasPromocodeRepository.findByPromocode(
            promocode.id,
          );

        const existingTicketCount =
          await this.bookingHasPromocodeRepository.countTicketsForBooking(
            bookingIds,
          );

        const remainingPromocodeQuantity =
          promocode.quantity - existingTicketCount;

        if (ticketCount > promocode.quantity - existingTicketCount) {
          throw new BadRequestException(
            `Promocode limit reached. No more tickets can be booked with this promocode.`,
          );
        }

        // Apply discount to the calculated price
        calculatedPrice -= (calculatedPrice * promocode.discount) / 100;
      }

      // 8. Ensure calculated price matches the provided total_price
      if (calculatedPrice !== createTicketBookingDto.total_price) {
        throw new BadRequestException(
          `Total price for tickets is invalid. Expected price: ${calculatedPrice}, but received: ${createTicketBookingDto.total_price}.`,
        );
      }

      // 9. Check if the requested ticket count does not exceed available tickets
      if (ticketCount > tickets.length) {
        throw new BadRequestException(
          `Requested ticket count (${ticketCount}) exceeds the available tickets (${tickets.length}).`,
        );
      }

      // 10. Select tickets randomly
      const selectedTickets = this.getRandomTickets(tickets, ticketCount);

      // 11. Create the ticket booking
      const ticketBooking = this.mapper.map(
        createTicketBookingDto,
        CreateTicketBookingDto,
        TicketBooking,
      );

      const createdBooking = await this.ticketBookingRepository.create(
        queryRunner.manager,
        ticketBooking,
        user,
      );

      // 12. Apply promocode to the booking if applicable
      if (createTicketBookingDto.hasPromocode && promocode) {
        await this.bookingHasPromocodeRepository.create(
          queryRunner.manager,
          createdBooking.booking_id,
          promocode.id,
          user,
        );
      }

      // 13. Handle partnership (if applicable)
      if (createTicketBookingDto.is_partnership) {
        const partnership = await this.partnershipRepository.create(
          queryRunner.manager,
          user,
          event.user_id,
          user,
          createdBooking,
        );
        if (!partnership) {
          throw new BadRequestException('Failed to create partnership');
        }
      }

      // 14. Handle gift (if applicable)
      if (createTicketBookingDto.hasGift) {
        const existingGift = await this.giftRepository.findByBookingId(
          queryRunner.manager,
          createdBooking.booking_id,
        );

        if (!existingGift) {
          await this.giftRepository.create(
            queryRunner.manager,
            user,
            createdBooking.booking_id,
            createTicketBookingDto.recipient_id,
            user,
          );
        }
      }

      // 15. Update ticket status and create participant tickets
      for (let i = 0; i < ticketCount; i++) {
        const status = createTicketBookingDto.hasGift ? 'Gifted' : 'Booked';
        const participantId = createTicketBookingDto.hasGift
          ? createTicketBookingDto.recipient_id
          : user;

        await this.ticketRepository.updateStatus(
          queryRunner.manager,
          selectedTickets[i].id,
          status,
        );

        await this.participantHasTicketRepository.create(
          queryRunner.manager,
          createdBooking.booking_id,
          selectedTickets[i].id,
          participantId,
          user,
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
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
