import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { TimeEntryService } from 'src/application/services/support/time-entry.service';
import { DeleteTimeEntryCommand } from 'src/application/commands/support/delete-time-entry.command';
@CommandHandler(DeleteTimeEntryCommand)
export class DeleteTimeEntryCommandHandler implements ICommandHandler<DeleteTimeEntryCommand> {
    constructor(private readonly timeEntryService: TimeEntryService) { }

    async execute(command: DeleteTimeEntryCommand): Promise<void> {
        const { id } = command;
        await this.timeEntryService.deleteTimeEntry(id);
    }
}