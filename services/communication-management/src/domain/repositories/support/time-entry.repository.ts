import { TimeEntry } from 'src/domain/entities/support/time-entry.entity';

export interface ITimeEntryRepository {
  create(timeEntry: TimeEntry): Promise<TimeEntry>;
  findAll(): Promise<TimeEntry[]>;
  findOneById(id: number): Promise<any>;
  findByTicketId(ticketId: number): Promise<any[]>;
  findByAgentId(agentId: number): Promise<any[]>;
  update(id: number, timeEntry: Partial<TimeEntry>): Promise<TimeEntry>;
  delete(id: number): Promise<void>;
  getAgentTimeReport(
    agentId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<{ totalTime: string }>;
}
