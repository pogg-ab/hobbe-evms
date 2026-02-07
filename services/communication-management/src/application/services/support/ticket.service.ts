import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITicketRepository } from 'src/domain/repositories/support/ticket.repository';
import {
  TicketResponseDto,
  CreateTicketDto,
  UpdateTicketDto,
} from 'src/presentation/dto/support/ticket/ticket.dto';
import { Ticket } from 'src/domain/entities/support/ticket.entity';
import { TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/support/ticket.repository.token';
import { FileStream } from 'src/application/commands/support/update-ticket.command';
import { SearchTicketsDto } from 'src/presentation/dto/support/ticket/search-tickets.dto';

@Injectable()
export class TicketService {
  constructor(
    @Inject(TICKET_REPOSITORY_TOKEN)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async createTicket(
    createTicketDto: CreateTicketDto,
  ): Promise<TicketResponseDto> {
    const validStatus = [2, 3, 4, 5, 6, 7];
    const validPriority = [1, 2, 3, 4];
    const ticketData: Partial<Ticket> & { attachments?: FileStream[] } = {
      subject: createTicketDto.subject,
      description: createTicketDto.description,
      email: createTicketDto.email,
      status: validStatus.includes(createTicketDto.status)
        ? createTicketDto.status
        : 2,
      user_id: createTicketDto.user_id,
      priority: validPriority.includes(createTicketDto.priority)
        ? createTicketDto.priority
        : 1,
      attachments: createTicketDto.attachments,
    };
    const createdTicket = await this.ticketRepository.create(ticketData);

    return this.mapToTicketResponseDto(createdTicket);
  }

  async findAllTickets(
    page?: number,
    perPage?: number,
  ): Promise<TicketResponseDto[]> {
    const tickets = await this.ticketRepository.findAll(page, perPage);
    return tickets.map(this.mapToTicketResponseDto);
  }

  async findTicketById(id: number): Promise<any> {
    const ticket = await this.ticketRepository.findOneById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  async updateTicket(
    id: number,
    updateTicketDto: UpdateTicketDto,
  ): Promise<TicketResponseDto> {
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

  private buildFreshdeskQuery(dto: SearchTicketsDto): string {
    const clauses: string[] = [];

    if (dto.priority !== undefined) {
      clauses.push(
        typeof dto.priority === 'number' && dto.priority > 3
          ? `priority:>${dto.priority - 1}`
          : `priority:${dto.priority}`,
      );
    }

    if (dto.status !== undefined) {
      clauses.push(`status:${dto.status}`);
    }

    if (dto.groupId !== undefined) {
      clauses.push(`group_id:${dto.groupId}`);
    }

    if (dto.agentId !== undefined) {
      clauses.push(`agent_id:${dto.agentId}`);
    }

    if (dto.type) {
      clauses.push(`type:'${dto.type}'`);
    }

    if (dto.tag) {
      clauses.push(`tag:'${dto.tag}'`);
    }

    if (dto.customString) {
      clauses.push(`custom_string:${dto.customString}`);
    }

    if (dto.createdAt) {
      clauses.push(`created_at:'${dto.createdAt}'`);
    }

    if (dto.dueByStart && dto.dueByEnd) {
      clauses.push(`due_by:>'${dto.dueByStart}' AND due_by:<'${dto.dueByEnd}'`);
    }

    return clauses.join(' AND ');
  }

  async searchTickets(dto: SearchTicketsDto): Promise<any[]> {
    const query = this.buildFreshdeskQuery(dto);
    const page = dto.page || 1;
    return this.ticketRepository.search(query, page);
  }

  private mapToTicketResponseDto(ticket: Ticket): TicketResponseDto {
    return {
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      email: ticket.email,
      priority: ticket.priority,
      status: ticket.status,
      user_id: ticket.user_id,
    };
  }
}
