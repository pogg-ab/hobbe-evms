import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITimeEntryRepository } from 'src/domain/repositories/support/time-entry.repository';
import { ITicketRepository } from 'src/domain/repositories/support/ticket.repository';
import {
  TimeEntryResponseDto,
  CreateTimeEntryDto,
} from 'src/presentation/dto/support/time-entry/time-entry.dto';
import { TimeEntry } from 'src/domain/entities/support/time-entry.entity';
import { AgentTimeReportResponseDto } from 'src/presentation/dto/support/agent/agent.dto';
import { TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/support/ticket.repository.token';
import { TIME_ENTRY_REPOSITORY_TOKEN } from 'src/domain/repositories/support/time-entry.repository.token';

@Injectable()
export class TimeEntryService {
  constructor(
    @Inject(TIME_ENTRY_REPOSITORY_TOKEN)
    private readonly timeEntryRepository: ITimeEntryRepository,
    @Inject(TICKET_REPOSITORY_TOKEN)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async createTimeEntry(
    ticketId: number,
    createTimeEntryDto: CreateTimeEntryDto,
  ): Promise<TimeEntryResponseDto> {
    const ticket = await this.ticketRepository.findOneById(ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }
    const timeEntry: TimeEntry = {
      id: 0,
      ticketId: ticketId,
      agentId: createTimeEntryDto.agentId,
      note: createTimeEntryDto.note,
      timeSpent: createTimeEntryDto.timeSpent,
      executedAt: createTimeEntryDto.executedAt
        ? new Date(createTimeEntryDto.executedAt)
        : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const createdTimeEntry = await this.timeEntryRepository.create(timeEntry);
    return this.mapToTimeEntryResponseDto(createdTimeEntry);
  }

  async findAllTimeEntries(): Promise<TimeEntryResponseDto[]> {
    const timeEntries = await this.timeEntryRepository.findAll();
    return timeEntries.map(this.mapToTimeEntryResponseDto);
  }

  async findTimeEntryById(id: number): Promise<any> {
    const timeEntry = await this.timeEntryRepository.findOneById(id);
    if (!timeEntry) {
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }
    return timeEntry;
  }

  async findTimeEntriesByTicketId(ticketId: number): Promise<any[]> {
    const ticket = await this.ticketRepository.findOneById(ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }
    const timeEntries = await this.timeEntryRepository.findByTicketId(ticketId);
    return timeEntries;
  }

  async findTimeEntriesByAgentId(
    agentId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    const timeEntries = await this.timeEntryRepository.findByAgentId(agentId);
    let filteredEntries = timeEntries;
    if (startDate && endDate) {
      filteredEntries = timeEntries.filter((entry) => {
        const executedAt = new Date(entry.executedAt);
        return executedAt >= startDate && executedAt <= endDate;
      });
    }
    return filteredEntries;
  }

  async deleteTimeEntry(id: number): Promise<void> {
    await this.timeEntryRepository.delete(id);
  }

  async getAgentTimeReport(
    agentId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<AgentTimeReportResponseDto> {
    const report = await this.timeEntryRepository.getAgentTimeReport(
      agentId,
      startDate,
      endDate,
    );
    return {
      agentId,
      totalTime: report.totalTime,
      startDate: startDate,
      endDate: endDate,
    };
  }

  private mapToTimeEntryResponseDto(
    timeEntry: TimeEntry,
  ): TimeEntryResponseDto {
    return {
      id: timeEntry.id,
      ticketId: timeEntry.ticketId,
      agentId: timeEntry.agentId,
      note: timeEntry.note,
      timeSpent: timeEntry.timeSpent,
      executedAt: timeEntry.executedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
