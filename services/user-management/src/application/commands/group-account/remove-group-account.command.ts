import { ICommand } from '@nestjs/cqrs';

export class RemoveGroupAccountCommand implements ICommand {
    constructor(
        public readonly groupAccountId: string,
        public readonly removedBy: string,
    ) { }
}