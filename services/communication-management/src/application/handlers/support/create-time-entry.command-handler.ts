import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { TimeEntryService } from 'src/application/services/support/time-entry.service';
import { CreateTimeEntryCommand } from 'src/application/commands/support/create-time-entry.command';
import { TimeEntryResponseDto } from 'src/presentation/dto/support/time-entry/time-entry.dto';
import { CreateTimeEntryDto } from 'src/presentation/dto/support/time-entry/time-entry.dto';

@CommandHandler(CreateTimeEntryCommand)
export class CreateTimeEntryCommandHandler implements ICommandHandler<CreateTimeEntryCommand> {
    constructor(private readonly timeEntryService: TimeEntryService) { }

    async execute(command: CreateTimeEntryCommand): Promise<TimeEntryResponseDto> {
        const { ticketId, agentId, note, timeSpent, executedAt } = command;
        const createTimeEntryDto: CreateTimeEntryDto = { agentId, note, timeSpent, executedAt };
        return this.timeEntryService.createTimeEntry(ticketId, createTimeEntryDto);
    }
}