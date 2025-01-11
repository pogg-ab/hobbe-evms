import { ICommand } from '@nestjs/cqrs';

export class UnblockCommand implements ICommand {
    constructor(
        public readonly followerId: string,
        public readonly followingId: string,
    ) { }
}
