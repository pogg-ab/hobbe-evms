import { Injectable, NotFoundException } from '@nestjs/common';
import { TimeEntry } from 'src/domain/entities/freshdesk/time-entry.entity';
import { ITimeEntryRepository } from 'src/domain/repositories/freshdesk/time-entry.repository';
import { FreshdeskConfigService } from 'src/infrastructure/freshdesk/freshdesk.config';
import axios from 'axios';

@Injectable()
export class TimeEntryRepositoryImpl implements ITimeEntryRepository {
    constructor(private readonly configService: FreshdeskConfigService) { }

    async create(timeEntry: TimeEntry): Promise<TimeEntry> {
        const response = await axios.post(
            `${this.configService.baseUrl}/tickets/${timeEntry.id}/time_entries`,
            timeEntry,
            { headers: this.configService.authHeader }
        );
        return response.data as TimeEntry;
    }

    async findAll(): Promise<TimeEntry[]> {
        const response = await axios.get(
            `${this.configService.baseUrl}/time_entries`,
            { headers: this.configService.authHeader }
        );
        return response.data as TimeEntry[];
    }

    async findOneById(id: number): Promise<TimeEntry | null> {
        try {
            const response = await axios.get(
                `${this.configService.baseUrl}/time_entries/${id}`,
                { headers: this.configService.authHeader }
            );
            return response.data as TimeEntry;
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    async findByTicketId(ticketId: number): Promise<TimeEntry[]> {
        const response = await axios.get(
            `${this.configService.baseUrl}/tickets/${ticketId}/time_entries`,
            { headers: this.configService.authHeader }
        );
        return response.data as TimeEntry[];
    }

    async findByAgentId(agentId: number): Promise<TimeEntry[]> {
        const response = await axios.get(
            `${this.configService.baseUrl}/time_entries?agent_id=${agentId}`,
            { headers: this.configService.authHeader }
        );
        return response.data as TimeEntry[];
    }

    async update(id: number, timeEntry: Partial<TimeEntry>): Promise<TimeEntry> {
        try {
            const response = await axios.put(
                `${this.configService.baseUrl}/time_entries/${id}`,
                timeEntry,
                { headers: this.configService.authHeader }
            );
            return response.data as TimeEntry;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new NotFoundException(`Time entry with ID ${id} not found`);
            }
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await axios.delete(
                `${this.configService.baseUrl}/time_entries/${id}`,
                { headers: this.configService.authHeader }
            );
        } catch (error) {
            if (error.response?.status === 404) {
                throw new NotFoundException(`Time entry with ID ${id} not found`);
            }
            throw error;
        }
    }

    async getAgentTimeReport(agentId: number, startDate: Date, endDate: Date): Promise<{ totalTime: string; }> {
        const response = await axios.get(
            `${this.configService.baseUrl}/time_entries?agent_id=${agentId}&executed_after=${startDate.toISOString()}&executed_before=${endDate.toISOString()}`,
            { headers: this.configService.authHeader }
        );
        const timeEntries = response.data as TimeEntry[];
        const totalTime = timeEntries.reduce((sum, entry) => sum + Number(entry.timeSpent || 0), 0);
        return {
            totalTime: totalTime.toString(),
        };
    }
}