import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { ITicketBookingRepository } from 'src/domain/repositories/ticket-booking/ticket-booking.repository';
import { TICKET_BOOKING_LIST_REPOSITORY_TOKEN } from 'src/domain/repositories/ticket-booking/ticket-bookinglist.repository.token';
import { CreateTicketBookingDto } from 'src/presentation/dtos/tickets/create-ticket-booking.dto';

@Injectable()
export class TicketBookingService {
  constructor(
    @Inject(TICKET_BOOKING_LIST_REPOSITORY_TOKEN)
    private readonly ticketBookingRepository: ITicketBookingRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async create(createTicketBookingDto: CreateTicketBookingDto): Promise<void> {
    const ticketBooking = this.mapper.map(
      createTicketBookingDto,
      CreateTicketBookingDto,
      TicketBooking,
    );
    await this.ticketBookingRepository.create(ticketBooking);
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

  async findAllByEvent(event_id: string): Promise<{
    ticketBookings: TicketBooking[] | null;
  }> {
    return this.ticketBookingRepository.findAllByEvent(event_id);
  }

  async findAllByTicketBuyer(ticket_buyer_id: string): Promise<{
    ticketBookings: TicketBooking[] | null;
  }> {
    return this.ticketBookingRepository.findAllByTicketBuyer(ticket_buyer_id);
  }

  async findAllByTicketOrganizer(ticket_organizer_id: string): Promise<{
    ticketBookings: TicketBooking[] | null;
  }> {
    return this.ticketBookingRepository.findAllByTicketOrganizer(
      ticket_organizer_id,
    );
  }

  async update(
    id: string,
    updateTicketBookingDto: CreateTicketBookingDto,
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
}
