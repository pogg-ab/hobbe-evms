export class Ticket {
    constructor(
        public readonly id: number,
        public readonly subject: string,
        public readonly description: string,
        public readonly email: string,
        public readonly priority: number,
        public readonly status: number,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }
}