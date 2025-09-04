import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { GroupAccount } from 'src/domain/entities/group-account.entity';
import { GroupAccountService } from 'src/application/services/group-account.service';
import { CreateGroupAccountCommand } from 'src/application/commands/group-account/create-group-account.command';

@CommandHandler(CreateGroupAccountCommand)
export class CreateGroupAccountCommandHandler implements ICommandHandler<CreateGroupAccountCommand> {
    constructor(private readonly groupAccountService: GroupAccountService) { }

    async execute(command: CreateGroupAccountCommand): Promise<GroupAccount> {
        const { createGroupAccountDto, createdBy } = command;
        return this.groupAccountService.create(createGroupAccountDto, createdBy);
    }
}

