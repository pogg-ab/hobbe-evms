import { TimeEntry } from "src/domain/entities/freshdesk/time-entry.entity";

export interface ITimeEntryRepository {
    create(timeEntry: TimeEntry): Promise<TimeEntry>;
    findAll(): Promise<TimeEntry[]>;
    findOneById(id: number): Promise<TimeEntry | null>;
    findByTicketId(ticketId: number): Promise<TimeEntry[]>;
    findByAgentId(agentId: number): Promise<TimeEntry[]>;
    update(id: number, timeEntry: Partial<TimeEntry>): Promise<TimeEntry>;
    delete(id: number): Promise<void>;
    getAgentTimeReport(agentId: number, startDate: Date, endDate: Date): Promise<{ totalTime: string; }>;
}