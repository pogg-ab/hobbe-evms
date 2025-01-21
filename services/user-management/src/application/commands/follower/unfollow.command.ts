import { ICommand } from '@nestjs/cqrs';

export class UnfollowCommand implements ICommand {
    constructor(
        public readonly followerId: string,
        public readonly followingId: string,
    ) { }
}
