export class UpdateConversationCommand {
    constructor(
        public readonly id: number,
        public readonly body?: string,
        public readonly isPrivate?: boolean,
    ) { }
}