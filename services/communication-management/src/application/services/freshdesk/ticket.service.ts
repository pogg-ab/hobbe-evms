import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITicketRepository } from 'src/domain/repositories/freshdesk/ticket.repository';
import { TicketResponseDto, CreateTicketDto, UpdateTicketDto } from 'src/presentation/dto/freshdesk/ticket/ticket.dto';
import { Ticket } from 'src/domain/entities/freshdesk/ticket.entity';
import { TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/freshdesk/ticket.repository.token';

@Injectable()
export class TicketService {
    constructor(
        @Inject(TICKET_REPOSITORY_TOKEN)
        private readonly ticketRepository: ITicketRepository) { }

    async createTicket(createTicketDto: CreateTicketDto): Promise<TicketResponseDto> {
        const ticket: Ticket = {
            subject: createTicketDto.subject,
            description: createTicketDto.description,
            email: createTicketDto.email,
            priority: createTicketDto.priority,
            status: createTicketDto.status,

        };
        const createdTicket = await this.ticketRepository.create(ticket);
        return this.mapToTicketResponseDto(createdTicket);
    }

    async findAllTickets(
        page?: number,
        perPage?: number,
        status?: number,
        priority?: number
    ): Promise<TicketResponseDto[]> {
        const skip = page && perPage ? (page - 1) * perPage : undefined;
        const take = perPage;

        let tickets: Ticket[];

        if (status !== undefined) {
            tickets = await this.ticketRepository.findByStatus(status);
        } else if (priority !== undefined) {
            tickets = await this.ticketRepository.findByPriority(priority);
        } else {
            tickets = await this.ticketRepository.findAll(skip, take);
        }

        return tickets.map(this.mapToTicketResponseDto);
    }

    async findTicketById(id: number): Promise<TicketResponseDto> {
        const ticket = await this.ticketRepository.findOneById(id);
        if (!ticket) {
            throw new NotFoundException(`Ticket with ID ${id} not found`);
        }
        return this.mapToTicketResponseDto(ticket);
    }

    async updateTicket(id: number, updateTicketDto: UpdateTicketDto): Promise<TicketResponseDto> {
        const ticket = await this.ticketRepository.update(id, {
            subject: updateTicketDto.subject,
            description: updateTicketDto.description,
            email: updateTicketDto.email,
            priority: updateTicketDto.priority,
            status: updateTicketDto.status,
        });
        return this.mapToTicketResponseDto(ticket);
    }

    async deleteTicket(id: number): Promise<void> {
        await this.ticketRepository.delete(id);
    }

    async searchTickets(query: string): Promise<TicketResponseDto[]> {
        const tickets = await this.ticketRepository.search(query);
        return tickets.map(this.mapToTicketResponseDto);
    }

    private mapToTicketResponseDto(ticket: Ticket): TicketResponseDto {
        return {
            subject: ticket.subject,
            description: ticket.description,
            email: ticket.email,
            priority: ticket.priority,
            status: ticket.status,
        };
    }
}