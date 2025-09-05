import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { GroupAccountService } from 'src/application/services/group-account.service';
import { RemoveGroupAccountCommand } from 'src/application/commands/group-account/remove-group-account.command';

@CommandHandler(RemoveGroupAccountCommand)
export class RemoveGroupAccountCommandHandler implements ICommandHandler<RemoveGroupAccountCommand> {
    constructor(private readonly groupAccountService: GroupAccountService) { }

    async execute(command: RemoveGroupAccountCommand): Promise<void> {
        const { groupAccountId, removedBy } = command;
        await this.groupAccountService.remove(groupAccountId, removedBy);
    }
}