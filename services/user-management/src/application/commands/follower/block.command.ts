import { ICommand } from '@nestjs/cqrs';

export class BlockCommand implements ICommand {
    constructor(
        public readonly followerId: string,
        public readonly followingId: string,
    ) { }
}
