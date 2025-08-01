import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { ITicketsRepository } from 'src/domain/repositories/tickets/tickets.repository';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { TICKETS_LIST_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/ticketslist.repository.token';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { group } from 'console';
import { QrCodeActionAfterScannedDto } from 'src/presentation/dtos/qr-code/qr-code-action-after-scanned.dto';
import { QrAfterScannedActionsAggregateDto } from 'src/presentation/dtos/qr-code/qr-scaned-after-scanned-action-aggregate.dto';

@Injectable()
export class TicketsService {
  constructor(
    @Inject(TICKETS_LIST_REPOSITORY_TOKEN)
    private readonly createTicketsRepository: ITicketsRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) { }

  async create(createTicketsDto: CreateTicketsDto): Promise<void> {
    const tickets = this.mapper.map(
      createTicketsDto,
      CreateTicketsDto,
      Tickets,
    );
    await this.createTicketsRepository.create(tickets);
  }

  async getEventsAllTicketsList(ticket_id: IdValueObject) {
    return this.createTicketsRepository.getEventsAllTicketsList(ticket_id);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{
    tickets: Tickets[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    return this.createTicketsRepository.findAll(page, limit);
  }

  async findAllByTicketsHeading(
    ticket_heading_id: string,
    tickets_type?: string,
    status?: string
  ): Promise<{
    tickets: any[] | null;
  }> {
    const SERVICE_CHARGE_RATE = 0.03; // 3% service charge
    const SALES_TAX_RATE = 0.10;

    const tickets = await this.createTicketsRepository.findAllByTicketsHeading(
      ticket_heading_id,
      tickets_type,
      status
    );

    if (!tickets) return { tickets: null };

    const ticketsWithCalculations = tickets.tickets.map(ticket => {
      const totalTicketPrice = ticket.price;

      const ticketPrice = parseFloat((totalTicketPrice / (1 + SERVICE_CHARGE_RATE + SALES_TAX_RATE)).toFixed(1));
      const serviceCharge = parseFloat((ticketPrice * SERVICE_CHARGE_RATE).toFixed(1));
      const salesTax = parseFloat((ticketPrice * SALES_TAX_RATE).toFixed(1));

      return {
        ...ticket,
        price: ticketPrice,
        serviceCharge,
        salesTax,
        totalPrice: totalTicketPrice,
        serviceChargeRate: (SERVICE_CHARGE_RATE * 100).toFixed(1) + '%',
        salesTaxRate: (SALES_TAX_RATE * 100).toFixed(1) + '%',
      };
    });

    return { tickets: ticketsWithCalculations };
  }


  async findAllByTicketsEvents(
    event_id: string,

  ): Promise<{
    tickets: Tickets[] | null;

  }> {
    return this.createTicketsRepository.findAllByTicketsHeading(event_id);
  }

  async findOne(id: string): Promise<any | null> {
    const SERVICE_CHARGE_RATE = 0.03;
    const SALES_TAX_RATE = 0.10;

    const ticket = await this.createTicketsRepository.findOne(id);
    if (!ticket) {
      throw new NotFoundException(`Event with id ${id} not found.`);
    }

    const totalTicketPrice = ticket.price;
    const ticketPrice = parseFloat((totalTicketPrice / (1 + SERVICE_CHARGE_RATE + SALES_TAX_RATE)).toFixed(1));
    const serviceCharge = parseFloat((ticketPrice * SERVICE_CHARGE_RATE).toFixed(1));
    const salesTax = parseFloat((ticketPrice * SALES_TAX_RATE).toFixed(1));

    return {
      ...ticket,
      price: ticketPrice,
      serviceCharge,
      salesTax,
      totalPrice: totalTicketPrice,
      serviceChargeRate: (SERVICE_CHARGE_RATE * 100).toFixed(1) + '%',
      salesTaxRate: (SALES_TAX_RATE * 100).toFixed(1) + '%',
    };
  }

  async findByCategory(
    page: number,
    limit: number,
    userId: string,
    category: 'upcoming' | 'past' | 'gifted',
  ): Promise<{
    groupedTickets: any | null;
    total: number;
    page: number;
    limit: number;
  }> {
    let tickets: ParticipantHasTicket[] = [];
    let total: number = 0;

    const groupTickets = (tickets: ParticipantHasTicket[]) => {
      const SERVICE_CHARGE_RATE = 0.03; // 3% service charge
      const SALES_TAX_RATE = 0.10;
      return (Array.isArray(tickets) ? tickets : []).reduce((acc, ticket) => {
        const eventObject = ticket.ticket_id.event_id;
        const event = JSON.stringify(eventObject);
        const eventId = JSON.parse(event).id;

        if (!acc[eventId]) {
          acc[eventId] = {
            event: eventObject,
            tickets: [],
            totalPrice: 0,
            totalServiceCharge: 0,
            totalSalesTax: 0,
          };
        }

        const totalTicketPrice = ticket.ticket_id.price;

        const ticketPrice = parseFloat((totalTicketPrice / (1 + SERVICE_CHARGE_RATE + SALES_TAX_RATE)).toFixed(1));
        const serviceCharge = parseFloat((ticketPrice * SERVICE_CHARGE_RATE).toFixed(1));
        const salesTax = parseFloat((ticketPrice * SALES_TAX_RATE).toFixed(1));

        acc[eventId].tickets.push({
          ticket_id: ticket.ticket_id.id,
          ticket_no: ticket.ticket_id.ticket_no,
          type: ticket.ticket_id.type,
          status: ticket.ticket_id.status,
          price: ticketPrice,
          serviceCharge: serviceCharge,
          salesTax: salesTax,
          totalPrice: totalTicketPrice,
          serviceChargeRate: (SERVICE_CHARGE_RATE * 100).toFixed(1) + '%',
          salesTaxRate: (SALES_TAX_RATE * 100).toFixed(1) + '%',
          hasPromcode: ticket.ticket_id.hasPromcode,
          participant_id: ticket.participant_id,
          qr_code: ticket.ticket_id.qr_code,
          created_at: ticket.created_at,
          updated_at: ticket.updated_at,
        });

        return acc;
      }, {});
    };

    if (category === 'upcoming') {
      tickets = await this.createTicketsRepository.findUpcomingTickets(userId, page, limit);
      total = await this.createTicketsRepository.countUpcomingTickets(userId);
    } else if (category === 'past') {
      tickets = await this.createTicketsRepository.findPastTickets(userId, page, limit);
      total = await this.createTicketsRepository.countPastTickets(userId);
    } else if (category === 'gifted') {
      tickets = await this.createTicketsRepository.findGiftedTickets(userId, page, limit);
      total = await this.createTicketsRepository.countGiftedTickets(userId);
    }

    const groupedTickets = groupTickets(tickets);

    return { groupedTickets, total, page, limit };
  }

  async qrCodeScannedLog(ticket_id: string, metadata: string): Promise<void> {
    return await this.createTicketsRepository.qrCodeScannedLog(ticket_id, metadata);
  }

  async qrCodeLogAfterScanned(
   dto: QrCodeActionAfterScannedDto
  ): Promise<void> {
    return await this.createTicketsRepository.qrCodeLogAfterScanned(dto);
  }


  async countQrCodeScannedLogs(event_id: string): Promise<any> {
    // Assuming you have a method in your repository to count scanned logs
    
    const data =  await this.createTicketsRepository.countQrCodeScannedLogs(event_id);
    
    return data;
  }

  async qrAfterScannedActionsAggregate(dto: QrAfterScannedActionsAggregateDto): Promise<any> {
    // Assuming you have a method in your repository to handle actions after scanned
    const actions = await this.createTicketsRepository.qrCodeActionsAfterScanned(dto);
    
    return actions;
  }

  async aggregateQrCodeScannedLogs(dto: any): Promise<any> {
    // Assuming you have a method in your repository to aggregate scanned logs
    const aggregatedLogs = await this.createTicketsRepository.aggregateQrCodeScannedLogs(dto);
    
    return aggregatedLogs;
  }


  //        async findByCategory(category:string):Promise<Events[]>{
  //         const event  = await this.createEventRepository.findByCategory(category);
  //         if(!event){
  //             throw new NotFoundException(`Event with Category ${category} not found.`);
  //         }

  //         return event;
  //        }

  //        async findByLocation(location:string):Promise<Events[]>{
  //         const event  = await this.createEventRepository.findByLocation(location);
  //         if(!event){
  //             throw new NotFoundException(`Event with location ${location} not found.`);
  //         }

  //         return event;
  //        }

  //        async search(keyword: string, page:number, limit:number): Promise<{events:Events[] | null,total:number}> {
  //            const events = await this.createEventRepository.search(keyword,page,limit);
  //            if (!events) {
  //             throw new NotFoundException(`Event with keyword ${keyword} not found.`);
  //            }
  //            return events;
  //         }

  //     async update(id: string, updateEventsDto: UpdateEventsDto,user: any): Promise<Events>{
  //         const event = await this.findOne(id);
  //         const updatedEvent = this.mapper.map(updateEventsDto, UpdateEventsDto, Events);
  //         await this.createEventRepository.update(id, updatedEvent,user);
  //         return updatedEvent;
  //     }

  //     async delete(id: string): Promise<void>{
  //         await this.createEventRepository.delete(id);
  //     }
}
